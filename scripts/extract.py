import glob
from math import e, gamma
import os
from pathlib import Path
from librosa import feature
import pandas as pd
import librosa
import datetime
import numpy as np
from sklearn.preprocessing import LabelEncoder
from tensorflow.keras.utils import to_categorical

from sklearn.model_selection import train_test_split
from sklearn.model_selection import GridSearchCV
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn import svm
from sklearn import metrics
import pickle


from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

from joblib import dump, load

listdir = []
labels = []
for file in Path().rglob('..\public\samples\*.flac'):#search files in that have extension .flac files 
    print(file.name)
    x = file.name
    labels.append((x.split('-'))[0])#split filename with '-' and select element with index 0
    listdir.append(Path.resolve(file.absolute()))#resolve path to the audio files 


df_all_data = pd.DataFrame() #Create a pandas dataframe
df_all_data['labels'] = labels #create label tables in pandas dataframe
df_all_data['audio_files'] = listdir #create audio files table in pandas dataframe

print(df_all_data.head())

df_all_data = df_all_data.sample(frac=1).reset_index(drop=True)

print(df_all_data.head())

print(df_all_data['labels'].value_counts(normalize=True))

def extract_features(files):
    
    # Sets the name to be the path to where the file is in my computer
    #file_name = os.path.join(os.path.abspath('voice')+'/'+str(files.file))
    file_name = files.audio_files
    # Loads the audio file as a floating point time series and assigns the default sample rate
    # Sample rate is set to 22050 by default
    X, sample_rate = librosa.load(file_name, res_type='kaiser_fast') 

    # Generate Mel-frequency cepstral coefficients (MFCCs) from a time series 
    mfccs = np.mean(librosa.feature.mfcc(y=X, sr=sample_rate, n_mfcc=40).T,axis=0)

    
    # We add also the classes of each file as a label at the end
    label = files.labels

    return mfccs, label


startTime = datetime.datetime.now()
features_label = df_all_data.apply(extract_features, axis=1)
print('time to extract features :'+str(datetime.datetime.now() - startTime))


labels = []
features = []
for feat, label in features_label:
    features.append(feat)
    labels.append(label)

print('len of features ')
print(len(features))

print('len of labels: ')
print(len(labels))
X = np.array(features)

y = np.array(labels)

lb = LabelEncoder()
y = lb.fit_transform(y)

print(X.shape)

print(y.shape)
# ss = StandardScaler()
# X = ss.fit_transform(X)

# pickle.dump(ss, open('scaler.pickle','wb'))

# sc = pickle.load(open('file/path/scaler.pkl','rb'))
print(X[0])


# X_train, X_test, Y_train, Y_test = train_test_split(X,y, test_size=0.25, shuffle = True)


# classifier = svm.SVC(kernel='poly', C = 1000, gamma= e-0.5)
# print('training the SVM model with poly kernel')
# startTime = datetime.datetime.now()
# classifier.fit(X_train, Y_train)
X_train, X_test, y_train, Y_test = train_test_split(X, y, random_state=0)
pipe = Pipeline([('scaler', StandardScaler()), ('svc', SVC(kernel='linear'))])
pipe.fit(X_train, y_train)
# Pipeline(steps=[('scaler', StandardScaler()), ('svc', SVC())])
print(pipe.score(X_test, Y_test))

dump(pipe, 'svmmodel.joblib')



print('time to train :'+str(datetime.datetime.now() - startTime))





# y_predicted = classifier.predict(X_test)

# print('Accuracy :', metrics.accuracy_score(Y_test, y_predicted))
# print('Recall :', metrics.recall_score(Y_test, y_predicted, average='macro'))
# print('Precision :', metrics.accuracy_score(Y_test, y_predicted))

y_predicted = pipe.predict(X_test)

print('Accuracy :', metrics.accuracy_score(Y_test, y_predicted))
print('Recall :', metrics.recall_score(Y_test, y_predicted, average='macro'))
print('Precision :', metrics.accuracy_score(Y_test, y_predicted))




# with open('trainedSvmModel.pickle', 'wb') as f:
#     pickle.dump(classifier, f)