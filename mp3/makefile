# Many thanks to:
# https://digitalcardboard.com/blog/2009/08/25/the-sox-of-silence/

../html5/sfx001.mp3 \
../html5/sfx002.mp3 \
../html5/sfx003.mp3 \
../html5/sfx006.mp3 \
../html5/sfx007.mp3 \
../html5/sfx013.mp3: 368323__littlerainyseasons__cute-magic-sounds.mp3
	mpg123 -w tmp.wav $^
	sox tmp.wav sfx.wav silence 1 0.2 1% 1 0.2 1% : newfile : restart
	lame sfx001.wav ../html5/sfx001.mp3
	lame sfx002.wav ../html5/sfx002.mp3
	lame sfx003.wav ../html5/sfx003.mp3
	lame sfx006.wav ../html5/sfx006.mp3
	lame sfx007.wav ../html5/sfx007.mp3
	lame sfx013.wav ../html5/sfx013.mp3
	rm *.wav
