import { Controller, Post, Body, BodyParam, UploadedFile, UploadedFiles } from 'typenexus';

@Controller()
export class UserController {
  @Post('/file')
  saveFile(@UploadedFile('fileName1') file: Express.Multer.File) {
    const { fieldname, originalname, mimetype } = file || {};
    return { fieldname, originalname, mimetype };
  }
  @Post('/multiple/file')
  saveFiles(@UploadedFiles('fileName') file: Express.Multer.File[], @BodyParam('text') text: string) {
    return {
      data: file.map(({ fieldname, encoding, originalname, mimetype }) => ({
        fieldname,
        encoding,
        originalname,
        mimetype,
      })),
      text,
    };
  }
}
