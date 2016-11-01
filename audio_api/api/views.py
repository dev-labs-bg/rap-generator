 # -*- coding: utf-8 -*-

import time
import json
from pydub import AudioSegment
from django.shortcuts import render
from django.http import HttpResponse
from django import forms
from forms import UploadForm
from os import listdir
from os.path import isfile, join

baseUrl = "http://192.168.10.118:8000/"

def index(request):
    return HttpResponse("Hey. <br />My name is Song API<br />Give me your audio!<br />I will not tell you bye,<br />I'll make songs, yo!<br />Peace homie!")

def merge_audio_files(file1, file2, fileOut):
    sound1 = AudioSegment.from_file(file1)
    sound2 = AudioSegment.from_file(file2)

    combined = sound1.overlay(sound2)

    combined.export(fileOut, format='mp3')

def handle_uploaded_file(f, filename):
    with open(filename, 'wb+') as destination:
        for chunk in f.chunks():
            destination.write(chunk)

def beats(request):
    beatsDir = "static/beats/"
    beatsResponse = []

    for f in listdir(beatsDir):
        fileName = join(beatsDir, f)
        if isfile(fileName):
            beatsResponse.append({
                "id": f,
                "url": baseUrl + fileName
            })

    return HttpResponse(json.dumps(beatsResponse))

def upload(request):
    form = UploadForm(request.POST, request.FILES)
    if request.method == 'POST':
        beatSound = 'static/beats/' + request.POST.get('beat', 'beat.mp3')

        if form.is_valid():
            uniqueTimeStamp = str(int(time.time()))
            filename = 'static/' + uniqueTimeStamp + '.mp3'
            handle_uploaded_file(request.FILES['audio'], filename)
            output = 'static/output-' + uniqueTimeStamp + '.mp3'
            merge_audio_files(filename, beatSound, output)

            return HttpResponse(json.dumps({
                "url": baseUrl + output
            }))
    else:
        return HttpResponse('test here: <form method="post" enctype="multipart/form-data">' + str(form) + '<input type=submit />')