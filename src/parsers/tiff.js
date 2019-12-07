import {AppSegment, parsers} from './core.js'
import {tagKeys, tagValues, tagRevivers} from '../tags.js'
import {TAG_IFD_EXIF, TAG_IFD_GPS, TAG_IFD_INTEROP, TAG_MAKERNOTE, TAG_USERCOMMENT, TAG_APPNOTES} from '../tags.js'
import {BufferView} from '../util/BufferView.js'
import {ConvertDMSToDD} from '../tags/tiff-revivers.js'
import {isEmpty} from '../util/helpers.js'


export const TIFF_LITTLE_ENDIAN = 0x4949
export const TIFF_BIG_ENDIAN    = 0x4D4D

const THUMB_OFFSET  = 0x0201
const THUMB_LENGTH  = 0x0202

const SIZE_LOOKUP = {
	1: 1, // BYTE      - 8-bit unsigned integer
	2: 1, // ASCII     - 8-bit bytes w/ last byte null
	3: 2, // SHORT     - 16-bit unsigned integer
	4: 4, // LONG      - 32-bit unsigned integer
	5: 8, // RATIONAL  - 64-bit unsigned fraction
	6: 1, // SBYTE     - 8-bit signed integer
	7: 1, // UNDEFINED - 8-bit untyped data
	8: 2, // SSHORT    - 16-bit signed integer
	9: 4, // SLONG     - 32-bit signed integer
	10: 8, // SRATIONAL - 64-bit signed fraction (Two 32-bit signed integers)
	11: 4, // FLOAT,    - 32-bit IEEE floating point
	12: 8, // DOUBLE    - 64-bit IEEE floating point
	// https://sno.phy.queensu.ca/~phil/exiftool/standards.html
	13: 4 // IFD (sometimes used instead of 4 LONG)
}

// jpg wraps tiff into app1 segment.
export class TiffCore extends AppSegment {

	parseHeader() {
		console.log('parseHeader')
		// Detect endian 11th byte of TIFF (1st after header)
		var byteOrder = this.chunk.getUint16()
		if (byteOrder === TIFF_LITTLE_ENDIAN)
			this.le = true // little endian
		else if (byteOrder === TIFF_BIG_ENDIAN)
			this.le = false // big endian
		else
			throw new Error('Invalid EXIF data: expected byte order marker (0x4949 or 0x4D4D).')
		this.chunk.le = this.le

		// Bytes 8 & 9 are expected to be 00 2A.
		if (this.chunk.getUint16(2) !== 0x002A)
			throw new Error('Invalid EXIF data: expected 0x002A.')

		this.headerParsed = true
	}

	parseTags(offset, blockKey) {
		console.log('parseTags', blockKey)
		let picks = this.options.getPickTags(blockKey, 'tiff')
		let skips = this.options.getSkipTags(blockKey, 'tiff')
		let onlyPick = picks.length > 0
		let entriesCount = this.chunk.getUint16(offset)
		offset += 2
		let block = {}
		for (let i = 0; i < entriesCount; i++) {
			let tag = this.chunk.getUint16(offset)
			if ((onlyPick && picks.includes(tag)) || (!onlyPick && !skips.includes(tag)))
				block[tag] = this.parseTag(offset)
			offset += 12
		}
		return block
	}

	parseTag(offset) {
		let type = this.chunk.getUint16(offset + 2)
		let valueCount = this.chunk.getUint32(offset + 4)
		let valueSize = SIZE_LOOKUP[type]
		let totalSize = valueSize * valueCount
		if (totalSize <= 4)
			offset = offset + 8
		else
			offset = this.chunk.getUint32(offset + 8)

		if (offset > this.chunk.byteLength)
			throw new Error(`tiff value offset ${offset} is outside of chunk size ${this.chunk.byteLength}`)

		// ascii strings, array of 8bits/1byte values.
		if (type === 2) {
			let string = this.chunk.getString(offset, valueCount)
			// remove null terminator
			while (string.endsWith('\0')) string = string.slice(0, -1)
			return string
		}

		// undefined/buffers of 8bit/1byte values.
		if (type === 7)
			return this.chunk.getUintArray(offset, valueCount)

		// Now that special cases are solved, we can return the normal uint/int value(s).
		if (valueCount === 1) {
			// Return single value.
			return this.parseTagValue(type, offset)
		} else {
			// Return array of values.
			let res = []
			for (let i = 0; i < valueCount; i++) {
				res.push(this.parseTagValue(type, offset))
				offset += valueSize
			}
			return res
		}
	}

	parseTagValue(type, offset) {
		switch (type) {
			case 1:  return this.chunk.getUint8(offset)
			case 3:  return this.chunk.getUint16(offset)
			case 4:  return this.chunk.getUint32(offset)
			case 5:  return this.chunk.getUint32(offset) / this.chunk.getUint32(offset + 4)
			case 6:  return this.chunk.getInt8(offset)
			case 8:  return this.chunk.getInt16(offset)
			case 9:  return this.chunk.getInt32(offset)
			case 10: return this.chunk.getInt32(offset) / this.chunk.getInt32(offset + 4)
			case 11: return this.chunk.getFloat(offset)
			case 12: return this.chunk.getDouble(offset)
			case 13: return this.chunk.getUint32(offset)
			default: throw new Error(`Invalid tiff type ${type}`)
		}
	}

}










const blockKeys = ['ifd0', 'thumbnail', 'exif', 'gps', 'interop']

/*
JPEG with EXIF segment starts with App1 header (FF E1, length, 'Exif\0\0') and then follows the TIFF.
Whereas .tif file format starts with the TIFF structure right away.

APP1 HEADER (only in JPEG)
- FF E1 - segment marker
- 2Bytes - segment length
- 45 78 69 66 00 00 - string 'Exif\0\0'

APP1 CONTENT
- TIFF HEADER (2b byte order, 2b tiff id, 4b offset of ifd1)
- IFD0
- Exif IFD
- Interop IFD
- GPS IFD
- IFD1
*/
export class TiffExif extends TiffCore {

	static type = 'tiff'
	static mergeOutput = true
	static headerLength = 10

	// .tif files do no have any APPn segments. and usually start right with TIFF header
	// .jpg files can have multiple APPn segments. They always have APP1 whic is a wrapper for TIFF.
	// We support both jpg and tiff so we're not looking for app1 segment but directly for TIFF
	// because app1 in jpg is only container for tiff.
	static canHandle(view, offset) {
		return view.getUint8(offset + 1) === 0xE1
			&& view.getUint32(offset + 4) === 0x45786966 // 'Exif'
			&& view.getUint16(offset + 8) === 0x0000     // followed by '\0'
	}

	// APP1 includes TIFF formatted values, grouped into IFD blocks (IFD0, Exif, Interop, GPS, IFD1)
	async parse() {
		//global.recordBenchTime(`tiffExif.parse()`)
		this.parseHeader()
		if (this.options.ifd0)      this.parseIfd0Block()                                  // APP1 - IFD0
		if (this.options.exif)      this.parseExifBlock()      // APP1 - EXIF IFD
		if (this.options.gps)       this.parseGpsBlock()       // APP1 - GPS IFD
		if (this.options.interop)   this.parseInteropBlock()   // APP1 - Interop IFD
		if (this.options.thumbnail) this.parseThumbnailBlock() // APP1 - IFD1
		this.translate()
		if (this.options.mergeOutput) {
			// NOTE: Not assigning thumbnail because it contains the same tags as ifd0.
			let {ifd0, exif, gps, interop} = this
			this.output = Object.assign({}, ifd0, exif, gps, interop)
		} else {
			//this.output = {ifd0, exif, gps, interop, thumbnail}
			this.output = {}
			for (let key of blockKeys) {
				let blockOutput = this[key]
				if (blockOutput && !isEmpty(blockOutput))
					this.output[key] = blockOutput
			}
		}
		if (this.makerNote)   this.output.makerNote   = this.makerNote
		if (this.userComment) this.output.userComment = this.userComment
		return this.output
	}

	findIfd0Offset() {
		if (this.ifd0Offset === undefined)
			this.ifd0Offset = this.chunk.getUint32(4)
	}

	parseIfd0Block() {
		console.log('parseIfd0Block')
		//global.recordBenchTime(`tiffExif.parseIfd0Block()`)
		if (this.ifd0) return
		// Read the IFD0 segment with basic info about the image
		// (width, height, maker, model and pointers to another segments)
		this.findIfd0Offset()
		console.log('this.ifd0Offset', this.ifd0Offset)
		if (this.ifd0Offset < 8)
			throw new Error('Invalid EXIF data: IFD0 offset should be less than 8')
		this.ensureChunkRead('IFD0', this.ifd0Offset, this.options.minimalTiffSize)
		// Parse IFD0 block.
		let ifd0 = this.ifd0 = this.parseTags(this.ifd0Offset, 'ifd0')
		// Cancel if the ifd0 is empty (imaged created from scratch in photoshop).
		if (Object.keys(ifd0).length === 0) return
		// Store offsets of other blocks in the TIFF segment.
		this.exifOffset    = ifd0[TAG_IFD_EXIF]
		this.interopOffset = ifd0[TAG_IFD_INTEROP]
		this.gpsOffset     = ifd0[TAG_IFD_GPS]
		this.appNotes      = ifd0[TAG_APPNOTES]
		// IFD0 segment also contains offset pointers to another segments deeper within the EXIF.
		if (this.options.sanitize) {
			delete ifd0[TAG_IFD_EXIF]
			delete ifd0[TAG_IFD_INTEROP]
			delete ifd0[TAG_IFD_GPS]
			delete ifd0[TAG_APPNOTES] // XMP in .tif
		}
		return ifd0
	}

	ensureChunkRead(blockName, blockOffset, minSize) {
		console.log('this.file.chunked', this.file.chunked)
		console.log('blockOffset', blockOffset)
		console.log('minSize', minSize)
		console.log('this.file.byteLength', this.file.byteLength)
		console.log('this.chunk.byteLength', this.chunk.byteLength)
		let end = blockOffset + minSize
		console.log('end', end)
		if (!this.file.chunked) {
			if (blockOffset > this.file.byteLength)
				throw new Error(`${blockName} offset points to outside of file.\nblockOffset: ${blockOffset}, file.byteLength: ${this.file.byteLength}`)
			//if (blockOffset + minSize > this.file.byteLength)
			//	throw new Error(`Not enough bytes of file are read to ensure ${blockName} block is properly parsed.\nblockOffset: ${blockOffset}, minSize: ${minSize}, file.byteLength: ${this.file.byteLength}`)
		} else if (blockOffset + minSize > this.chunk.byteLength) {
			// This is unusual case in jpeg files, but happens often in tiff files.
			// .tif files start with TIFF structure header. It contains pointer to IFD0. But the IFD0 data can be at the end of the file.
			// We only read a small chunk, managed to find IFD0, but that position in the file isn't read yet.
			console.warn('work in progress: TODO: IMPLEMENT ME')
			throw new Error(`${blockName} offset points to outside of currently loaded bytes.\nblockOffset: ${blockOffset}, minSize: ${minSize}, chunk.byteLength: ${this.chunk.byteLength}`)
		}
		if (blockOffset/* + minSize*/ > this.chunk.byteLength) {
			// We need to step outside, and work with the whole file because all other pointers are absolute values from start of the file.
			// That includes other IFDs and even tag values longer than 4 bytes are indexed (see .parseTag())
			// WARNING: Creating different view on top of file with TIFFs endian mode, because TIFF structure typically uses different endiannness.
			this.chunk = BufferView.from(this.file, this.le)
		}
	}

	// EXIF block of TIFF of APP1 segment
	// 0x8769
	parseExifBlock() {
		if (this.exif) return
		if (!this.ifd0) this.parseIfd0Block()
		if (this.exifOffset === undefined) return
		let exif = this.exif = this.parseTags(this.exifOffset, 'exif')
		if (!this.interopOffset) this.interopOffset = exif[TAG_IFD_INTEROP]
		this.makerNote   = exif[TAG_MAKERNOTE]
		this.userComment = exif[TAG_USERCOMMENT]
		if (this.options.sanitize) {
			delete exif[TAG_IFD_INTEROP]
			delete exif[TAG_MAKERNOTE]
			delete exif[TAG_USERCOMMENT]
		}
		return exif
	}

	// GPS block of TIFF of APP1 segment
	// 0x8825
	parseGpsBlock() {
		if (this.gps) return
		if (!this.ifd0) this.parseIfd0Block()
		if (this.gpsOffset === undefined) return
		let gps = this.gps = this.parseTags(this.gpsOffset, 'gps')
		if (gps && gps[GPS_LAT] && gps[GPS_LON]) {
			gps.latitude  = ConvertDMSToDD(...gps[GPS_LAT], gps[GPS_LATREF])
			gps.longitude = ConvertDMSToDD(...gps[GPS_LON], gps[GPS_LONREF])
		}
		return gps
	}

	// INTEROP block of TIFF of APP1 segment
	// 0xA005
	parseInteropBlock() {
		if (this.interop) return
		if (!this.ifd0) this.parseIfd0Block()
		if (this.interopOffset === undefined && !this.exif) this.parseExifBlock()
		if (this.interopOffset === undefined) return
		return this.interop = this.parseTags(this.interopOffset, 'interop')
	}

	// THUMBNAIL block of TIFF of APP1 segment
	// parsing this block is skipped when mergeOutput is true because thumbnail block contains with the same tags like ifd0 block
	// and one would override the other. 
	parseThumbnailBlock(force = false) {
		if (this.thumbnail || this.thumbnailParsed) return
		if (this.options.mergeOutput && !force) return
		this.findIfd0Offset()
		let ifd0Entries = this.chunk.getUint16(this.ifd0Offset)
		let temp = this.ifd0Offset + 2 + (ifd0Entries * 12)
		// IFD1 offset is number of bytes from start of TIFF header where thumbnail info is.
		this.ifd1Offset = this.chunk.getUint32(temp)
		if (this.ifd1Offset > 0) {
			this.ifd1 = this.parseTags(this.ifd1Offset, 'thumbnail')
			this.thumbnail = this.ifd1
			this.thumbnailParsed = true
		}
		return this.thumbnail
	}

	// THUMBNAIL buffer of TIFF of APP1 segment
	extractThumbnail() {
		if (!this.headerParsed) this.parseHeader()
		if (!this.thumbnailParsed) this.parseThumbnailBlock(true)
		if (this.thumbnail === undefined) return 
		// TODO: replace 'ThumbnailOffset' & 'ThumbnailLength' by raw keys (when tag dict is not included)
		let offset = this.thumbnail[THUMB_OFFSET]
		let length = this.thumbnail[THUMB_LENGTH]
		return this.chunk.getUintArray(offset, length)
	}

	translate() {
		if (this.canTranslate) {
			for (let block of blockKeys) {
				if (block in this) {
					this[block] = this.translateBlock(this[block], block)
				}
			}
		}
	}

}

export const GPS_LATREF = 0x0001
export const GPS_LAT    = 0x0002
export const GPS_LONREF = 0x0003
export const GPS_LON    = 0x0004


parsers.tiff = TiffExif
