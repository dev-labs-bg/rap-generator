 # -*- coding: utf-8 -*-

import time
from pydub import AudioSegment
from django.shortcuts import render
from django.http import HttpResponse
from django import forms
from forms import DocumentForm

def index(request):
    return HttpResponse("Hey. <br />My name is Song API<br />Give me your audio!<br />I will not tell you bye,<br />I'll make songs, yo!<br />Peace homie!")

def merge_audio_files(file1, file2, fileOut):
    sound1 = AudioSegment.from_file(file1)
    sound2 = AudioSegment.from_mp3(file2)

    combined = sound1.overlay(sound2)

    combined.export(fileOut, format='mp3')

def handle_uploaded_file(f):
    filename = 'static/' + str(int(time.time())) + '.mp3'
    with open(filename, 'wb+') as destination:
        for chunk in f.chunks():
            destination.write(chunk)
    return filename

def upload(request):
    form = DocumentForm(request.POST, request.FILES)
    if request.method == 'POST':
        if form.is_valid():
            filename = handle_uploaded_file(request.FILES['docfile'])
            beatSound = 'static/beat.mp3'
            output = 'static/output.mp3'
            merge_audio_files(filename, beatSound, output)

            return HttpResponse(output)
    else:
        return HttpResponse('test here: <form method="post" enctype="multipart/form-data">' + str(form) + '<input type=submit />')