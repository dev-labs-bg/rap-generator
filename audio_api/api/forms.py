# -*- coding: utf-8 -*-

from django import forms


class UploadForm(forms.Form):
    audio = forms.FileField(
        label='Select a file'
    )
    beat = forms.CharField(
        label='Beat name'
    )
