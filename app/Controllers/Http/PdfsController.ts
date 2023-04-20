// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Pdf from 'App/Models/Pdf';
import PdfImage from 'App/Models/PdfImage';
import PdfImageValidator from 'App/Validators/PdfImageValidator';
import Application from '@ioc:Adonis/Core/Application'
import { PDFDocument } from 'pdf-lib';
import path from 'path';
import fs from 'fs/promises';
import {v4 as uuid} from 'uuid'

export default class PdfsController {

    async init({auth})
    {
        const pdf = await Pdf.create({userId: auth.user.id})
        return pdf
    }

    async uploadImage({request})
    {
        const payload = await request.validate(PdfImageValidator)
        const file = request.file('image')
        const pdfId = request.param('id')

        const name = `${uuid()}.${file.extname}`
        await file.move(Application.tmpPath('uploads'), {name})

        const image = await PdfImage.create({
            path: name,
            pdfId,
            index: payload.index
        })

        return image
    }

    async export({request})
    {
        const pdfId = request.param('id')
        const pdf = await Pdf.findOrFail(pdfId)
        await pdf.load('images')
        const tmpPath = Application.tmpPath('uploads')
        
        const pdfDoc = await PDFDocument.create()

        for (const image of pdf.images.sort((x, y) => x.index - y.index)) {
            const imagePath = tmpPath + path.sep + image.path
            const extName = path.extname(imagePath)

            const buffer = await fs.readFile(imagePath)
            const pageImage = extName.includes('jp') ? await pdfDoc.embedJpg(buffer) : await pdfDoc.embedPng(buffer)
            const { width, height } = pageImage.scale(0.5)
            const page = pdfDoc.addPage([width, height])

            // Draw the image onto the page
            const pngDims = pageImage.scale(0.5)
            page.drawImage(pageImage, {
                x: 0,
                y: 0,
                width: pngDims.width,
                height: pngDims.height,
            })
        }

        const pdfBytes = await pdfDoc.save()
        const outputPath = `${tmpPath}${path.sep}${pdf.id}.ged-large-file.pdf`

        await fs.writeFile(outputPath, pdfBytes)

        pdf.outputPath = outputPath
        await pdf.save()

        return pdf.serialize({
            fields: ['id', 'userId'],
            relations: {
                images: {
                    fields: ['id', 'index', 'path']
                }
            }
        })
    }

}
