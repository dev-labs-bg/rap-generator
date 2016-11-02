# -*- coding: utf-8 -*-

from django import forms

class UploadForm(forms.Form):
    audio = forms.FileField(
        label='Select a file'
    )
    beat = forms.CharField(
        label='Beat name'
    )

class TtsForm(forms.Form):
    text = forms.CharField(
        label='Text here'
    )

class TextToRapForm(forms.Form):
    text = forms.CharField(
        label='Text here'
    )
    beat = forms.CharField(
        label='Beat name'
    )
    speed = forms.CharField(
        label='Speed (defaults to 175)',
        required=False
    )
    pitch = forms.CharField(
        label='Pitch 0 to 99 (defaults to 50)',
        required=False
    )
    amplitude = forms.CharField(
        label='Amplitude 0 to 200 (defaults to 100)',
        required=False
    )
    gap = forms.CharField(
        label='Word gap - The value is the length of the pause, in units of 10 mS (at the default speed of 170 wpm).',
        required=False
    )
