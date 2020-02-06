import {tagRevivers, createDictionary} from '../tags.js'
import {toAsciiString} from '../util/BufferView.js'

const ifd0 = createDictionary(tagRevivers, 'ifd0', [
	[0xC68B, toAsciiString],
	[0x0132, reviveDate],
])

tagRevivers.set('thumbnail', ifd0)

createDictionary(tagRevivers, 'exif', [
	[0xA000, reviveVersion],
	[0x9000, reviveVersion],
	[0x9003, reviveDate],
	[0x9004, reviveDate],
])

createDictionary(tagRevivers, 'gps', [
	[0x0000, val => Array.from(val).join('.')], // GPSVersionID
	[0x0007, val => Array.from(val).join(':')], // GPSTimeStamp
])

function reviveVersion(bytes) {
	let array = Array.from(bytes).slice(1)
	if (array[1] > 0x0f)
		array = array.map(code => String.fromCharCode(code))
	if (array[2] === '0' || array[2] === 0) array.pop()
	return array.join('.')
}

function reviveDate(string) {
	if (typeof string !== 'string') return null
	string = string.trim()
	var [dateString, timeString] = string.split(' ')
	var [year, month, day] = dateString.split(':').map(Number)
	var date = new Date(year, month - 1, day)
	if (timeString) {
		var [hours, minutes, seconds] = timeString.split(':').map(Number)
		date.setHours(hours)
		date.setMinutes(minutes)
		date.setSeconds(seconds)
	}
	return date
}