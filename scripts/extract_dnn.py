import glob
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
from sklearn.preprocessing import StandardScaler
from sklearn import svm
from sklearn import metrics
from tensorflow.keras import metrics
import pickle

listdir = []
labels = []
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout 
from tensorflow.keras.wrappers.scikit_learn import KerasRegressor

from tensorflow.keras.callbacks import EarlyStopping

from tensorflow.keras import regularizers
import matplotlib.pyplot as plt

from tensorflow.keras import backend as K

for file in Path().rglob('*.flac'):#search files in that have extension .flac files 
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
    # print(sample_rate)

    # Generate Mel-frequency cepstral coefficients (MFCCs) from a time series 
    mfccs = np.mean(librosa.feature.mfcc(y=X, sr=sample_rate, n_mfcc=40).T,axis=0)

    
    # We add also the classes of each file as a label at the end
    label = files.labels

    return mfccs, label

def recall_m(y_true, y_pred):
    true_positives = K.sum(K.round(K.clip(y_true * y_pred, 0, 1)))
    possible_positives = K.sum(K.round(K.clip(y_true, 0, 1)))
    recall = true_positives / (possible_positives + K.epsilon())
    return recall

def precision_m(y_true, y_pred):
    true_positives = K.sum(K.round(K.clip(y_true * y_pred, 0, 1)))
    predicted_positives = K.sum(K.round(K.clip(y_pred, 0, 1)))
    precision = true_positives / (predicted_positives + K.epsilon())
    return precision

def f1_m(y_true, y_pred):
    precision = precision_m(y_true, y_pred)
    recall = recall_m(y_true, y_pred)
    return 2*((precision*recall)/(precision+recall+K.epsilon()))



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

print('len of labels set() : ')
print(len(set(labels)))
X = np.array(features)

y = np.array(labels)

lb = LabelEncoder()
y = to_categorical(lb.fit_transform(y))

print(X.shape)

print(y.shape)
# ss = StandardScaler()
# X = ss.fit_transform(X)
# print(X[0])


X_train, X_test, Y_train, Y_test = train_test_split(X,y, test_size=0.25, shuffle=True)

X_train = X[:int(0.65* len(X))]
y_train = y[:int(0.65* len(X))]
# print('len of labels y_train set() : ', len(set(y_train)))
X_val = X[int(0.65* len(X)):int(0.75*len(X))]
y_val = y[int(0.65* len(X)):int(0.75*len(X))]


'''
classifier = svm.SVC(kernel='poly')
print('training the SVM model with poly kernel')
startTime = datetime.datetime.now()
classifier.fit(X_train, Y_train)

print('time to train :'+str(datetime.datetime.now() - startTime))

y_predicted = classifier.predict(X_test)
'''


model = Sequential()

model.add(Dense(40, input_shape=(40,), activation = 'linear'))
model.add(Dropout(0.1))

model.add(Dense(180, activation = 'linear'))
model.add(Dropout(0.25))  

model.add(Dense(512, activation = 'linear'))
model.add(Dropout(0.5))    

model.add(Dense(392, activation = 'linear'))
model.add(Dropout(0.5))   

model.add(Dense(len(set(labels)), activation = 'softmax'))

model.compile(loss='categorical_crossentropy', metrics=['accuracy',f1_m,precision_m, recall_m], optimizer='adam')

early_stop = EarlyStopping(monitor='val_loss', min_delta=0, patience=100, verbose=1, mode='auto')

history = model.fit(X_train, y_train, batch_size=256, epochs=400, 
                    validation_data=(X_val, y_val),
                    callbacks=[early_stop])

# evaluate the model
loss, accuracy, f1_score, precision, recall = model.evaluate(X_test, Y_test, verbose=0)
# print(loss, accuracy, f1_score, precision, recall)























# print('Accuracy :', metrics.accuracy_score(Y_test, y_predicted))
# print('Recall :', metrics.recall_score(Y_test, y_predicted, average='macro'))
# print('Precision :', metrics.accuracy_score(Y_test, y_predicted))


# with open('trainedSvmModel.pickle', 'wb') as f:
# #     pickle.dump(classifier, f)
# preds = model.predict_classes(X_test)
# print(preds)
# # print(Y_test.maxarg())
# preds = lb.inverse_transform(preds)
# # y_predicted = lb.inverse_transform(preds)
# y_predicted = np.argmax(Y_test, axis =0 )
# print(y_predicted)

# print(Y_test)
# print('Accuracy :', metrics.accuracy_score(Y_test, y_predicted))
# print('Recall :', metrics.recall_score(Y_test, y_predicted, average='macro'))
# print('Precision :', metrics.accuracy_score(Y_test, y_predicted))


# Check out our train accuracy and validation accuracy over epochs.
print(history.history.keys())
train_accuracy = history.history['accuracy']
val_accuracy = history.history['val_accuracy']
precision_ma = history.history['precision_m']
recall_ma = history.history['recall_m']

# Set figure size.
plt.figure(figsize=(12, 8))

# Generate line plot of training, testing loss over epochs.
plt.plot(train_accuracy, label='Training Accuracy', color='#185fad')
plt.plot(val_accuracy, label='Validation Accuracy', color='orange')
plt.plot(precision_ma, label='Precision', color='red')
plt.plot(recall_ma, label='Recall', color='green')
# Set title
plt.title('Training and Validation Accuracy by Epoch', fontsize = 25)
plt.xlabel('Epoch', fontsize = 18)
plt.ylabel('Categorical Crossentropy', fontsize = 18)
plt.xticks(range(0,400,20), range(0,400,20))
plt.legend(fontsize = 18)
plt.show()