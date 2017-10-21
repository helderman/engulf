# Generate audio sprites,
#
# I deliberately did not use variable bitrates (lame -v);
# it made playback of the audio sprites laggy on some of my slowest machines.
#
# Many thanks to:
# https://digitalcardboard.com/blog/2009/08/25/the-sox-of-silence/
# https://stackoverflow.com/questions/13192873/how-to-extend-audio-to-to-a-specified-length

../html5/audiosprites.mp3: 368323__littlerainyseasons__cute-magic-sounds.mp3
	mpg123 -w all.wav $<
	sox -r 48k -b 16 -c 2 -n quiet.wav trim 0.0 3.0
	sox all.wav sfx.wav silence 1 0.2 1% 1 0.2 1% : newfile : restart
	sox -m -v 1 sfx001.wav quiet.wav sfx001_padded.wav
	sox -m -v 1 sfx002.wav quiet.wav sfx002_padded.wav
	sox -m -v 1 sfx003.wav quiet.wav sfx003_padded.wav
	sox -m -v 1 sfx006.wav quiet.wav sfx006_padded.wav
	sox -m -v 1 sfx007.wav quiet.wav sfx007_padded.wav
	sox -m -v 1 sfx013.wav quiet.wav sfx013_padded.wav
	sox sfx0{07,06,13,01,02,03}_padded.wav audiosprites.wav
	lame audiosprites.wav $@
	rm all.wav quiet.wav sfx*.wav audiosprites.wav
