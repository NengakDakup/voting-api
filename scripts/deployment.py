import glob
import os
from pathlib import Path
from librosa import feature
import pandas as pd
import librosa
import datetime
import numpy as np
from sklearn.preprocessing import LabelEncoder
# from tensorflow.keras.utils import to_categorical

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn import svm
from sklearn import metrics
import pickle
from joblib import dump, load


def extract_features(file_name):
    
    # Sets the name to be the path to where the file is in my computer
    #file_name = os.path.join(os.path.abspath('voice')+'/'+str(files.file))
    # file_name = files.audio_files
    # Loads the audio file as a floating point time series and assigns the default sample rate
    # Sample rate is set to 22050 by default
    X, sample_rate = librosa.load(file_name, res_type='kaiser_fast') 

    # Generate Mel-frequency cepstral coefficients (MFCCs) from a time series 
    mfccs = np.mean(librosa.feature.mfcc(y=X, sr=sample_rate, n_mfcc=40).T,axis=0)

    
    # We add also the classes of each file as a label at the end
    # label = files.labels

    return mfccs


def predict(filename):
    feature = extract_features(filename)
    
    feature = np.array(feature)
    feature = np.reshape(feature, (1,-1)) 

    # ss = pickle.load(open('scaler.pickle','rb'))
    # # print(feature)
    # feature = ss.fit_transform(feature)
    # print(feature)
    # ss = StandardScaler()
    # feature = ss.fit_transform(feature)
    # print(feature)
    # feature.reshape(1,-1)

    # print(feature.shape)
    
    # model_file= open('trainedSvmModel.pickle', 'rb')
    
    # model = pickle.load(model_file)
    model = load('svmmodel.joblib')

    prediction = model.predict(feature)
    print('predicted that its speaker ->', prediction)
    return prediction

# for file in Path().rglob('*.flac'):#search files in that have extension .flac files 
#split filename with '-' and select element with index 0
predict('C:\Users\RAZER\Desktop\projects\chimdi\voting-api\routes\api\..\..\public\samples\00-wisdom-0.flac')
