 # -*- coding: utf-8 -*-

import time
import json
from pydub import AudioSegment
from django.shortcuts import render
from django.http import HttpResponse
from django import forms
from forms import UploadForm, TtsForm, TextToRapForm
from os import listdir
from os.path import isfile, join
from subprocess import call

def index(request):
    return HttpResponse("Hey. <br />My name is Song API<br />Give me your audio!<br />I will not tell you bye,<br />I'll make songs, yo!<br />Peace homie!")

def merge_audio_files(file1, file2, fileOut):
    sound1 = AudioSegment.from_file(file1)
    sound2 = AudioSegment.from_file(file2)

    combined = sound1.overlay(sound2)

    # combine the audios, add the original video to the output file too!
    combined.export(fileOut, format='mp4', parameters=['-i', file1])

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
                "url": request.build_absolute_uri("/" + fileName)
            })

    return HttpResponse(json.dumps(beatsResponse))

def upload(request):
    form = UploadForm(request.POST, request.FILES)
    if request.method == 'POST':
        beatSound = 'static/beats/' + request.POST.get('beat', 'track1.mp3')

        if form.is_valid():
            filename = 'static/' + str(int(time.time())) + '.mp3'
            handle_uploaded_file(request.FILES['audio'], filename)
            # takes ordinary audio/video file, returns rap file
            rapSongFile = rappify(filename, beatSound)

            return HttpResponse(json.dumps({
                "url": request.build_absolute_uri("/" + rapSongFile)
            }))
    else:
        return HttpResponse('test here: <form method="post" enctype="multipart/form-data">' + str(form) + '<input type=submit />')

def rappify(userAudio, beatSound):
    output = 'static/output-' + str(int(time.time())) + '.mp4'
    merge_audio_files(userAudio, beatSound, output)

    return output

def textToSpeech(text, beat=False, speed=False, pitch=False, amplitude=False, gap=False):
    # takes text, returns speech
    # beat is in arguments, but not used, fix it
    fileName = "static/tts/" + str(int(time.time())) + ".wav"

    callParameters = ["espeak", "-vbg", "-w " + fileName]

    if speed:
        callParameters += ["-s " + speed.encode("utf-8")]
    if pitch:
        callParameters += ["-p " + pitch.encode("utf-8")]
    if amplitude:
        callParameters += ["-a " + amplitude.encode("utf-8")]
    if gap:
        callParameters += ["-g " + gap.encode("utf-8")]

    callParameters += [text.encode("utf-8")]
    call(callParameters)

    return fileName

def tts(request):
    form = TtsForm(request.POST, request.FILES)
    if request.method == 'POST':
        # q = request.POST.get('text', 'send text plz')
        fileName = textToSpeech(**request.POST.dict())

        return HttpResponse(request.build_absolute_uri("/" + fileName))
    else:
        return HttpResponse('test here: <form method="post">' + str(form) + '<input type=submit />')

def textToRap(request):
    form = TextToRapForm(request.POST, request.FILES)
    if request.method == 'POST':
        q = request.POST.get('text', 'send text, yo yo, uh, twenty sixteen, yo').encode('utf-8')
        beatSound = 'static/beats/' + request.POST.get('beat', 'track1.mp3')
        uniqueTimeStamp = str(int(time.time()))
        output = 'static/output-' + uniqueTimeStamp + '.mp4'

        speechFile = textToSpeech(**request.POST.dict())
        rapSongFile = rappify(speechFile, beatSound)

        return HttpResponse(json.dumps({
            "url": request.build_absolute_uri("/" + rapSongFile)
        }))
    else:
        return HttpResponse('test here: <form method="post">' + str(form) + '<input type=submit />')
