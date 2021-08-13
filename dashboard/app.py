#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
#  app.py
#  
#  Copyright 2021 Adi Sucipto <acepby@gmail.com>
#  
#  This program is free software; you can redistribute it and/or modify
#  it under the terms of the GNU General Public License as published by
#  the Free Software Foundation; either version 2 of the License, or
#  (at your option) any later version.
#  
#  This program is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU General Public License for more details.
#  
#  You should have received a copy of the GNU General Public License
#  along with this program; if not, write to the Free Software
#  Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
#  MA 02110-1301, USA.
#  
#  
from flask import Flask, render_template, send_from_directory

app = Flask(__name__ ) #, static_folder="../data" )

@app.route('/')
def index():
	return render_template('peta.html')
	
@app.route('/about')
def about():
	return render_template('peta.html')
	
@app.route('/peta')
def peta():
	return render_template('peta.html')

@app.route('/data/<path:filename>')
def data_source(filename):
	return send_from_directory('../data',filename)

if __name__ == '__main__':
	app.run(debug=True)
    
