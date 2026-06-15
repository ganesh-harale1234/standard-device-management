import { Component } from '@angular/core';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { PdfViewerModule } from 'ng2-pdf-viewer';
@Component({
  selector: 'app-helps',
  imports:  [NgxExtendedPdfViewerModule,PdfViewerModule] ,  
  templateUrl: './helps.html',
  styleUrl: './helps.scss',
})
export class Helps {
pdfSrc = "assets/images/HelpDocument.pdf";
}
