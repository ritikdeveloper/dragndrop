import { Component, ViewChild, type ElementRef, type AfterViewInit } from "@angular/core"
import * as pdfjsLib from "pdfjs-dist"
import  { ParameterService } from "../parameter.service"
import  { PlaceholderService } from "../placeholder.service"
import { firstValueFrom } from "rxjs"

// Set the worker source path
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

@Component({
  selector: "app-pdf-viewer",
  templateUrl: "./pdf-viewer.component.html",
  styleUrls: ["./pdf-viewer.component.scss"],
})
export class PdfViewerComponent implements AfterViewInit {
  @ViewChild("pdfCanvas") canvas!: ElementRef
  @ViewChild("fileInput") fileInput!: ElementRef<HTMLInputElement>

  parameters: any[] = []
  placeholders: any[] = []
  currentPage = 1
  totalPages = 0
  scale = 1.0
  pdfLoaded = false
  isLoading = false
  errorMessage = ""

  // For drag and drop file upload
  isDraggingFile = false

  constructor(
    private paramService: ParameterService,
    private placeholderService: PlaceholderService,
  ) {}

  ngAfterViewInit() {
    this.loadParameters()
    this.loadSavedPlaceholders()

    // Subscribe to PDF data changes
    this.placeholderService.pdfData$.subscribe((data) => {
      if (data) {
        this.pdfLoaded = true
        this.renderPdf(data)
      } else {
        this.pdfLoaded = false
        this.totalPages = 0
        this.currentPage = 1
      }
    })
  }

  private async renderPdf(pdfData: ArrayBuffer) {
    try {
      this.isLoading = true
      this.errorMessage = ""

      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise
      this.totalPages = pdf.numPages
      this.currentPage = 1
      await this.renderPage(pdf, this.currentPage)

      this.isLoading = false
    } catch (error) {
      this.isLoading = false
      this.errorMessage = "Failed to render PDF. Please check if the file is a valid PDF."
      console.error("PDF rendering failed:", error)
    }
  }

  private async renderPage(pdf: pdfjsLib.PDFDocumentProxy, pageNumber: number) {
    try {
      const page = await pdf.getPage(pageNumber)

      const viewport = page.getViewport({ scale: this.scale })
      const canvas = this.canvas.nativeElement
      const context = canvas.getContext("2d")

      canvas.height = viewport.height
      canvas.width = viewport.width

      await page.render({ canvasContext: context, viewport }).promise
    } catch (error) {
      console.error("Error rendering page:", error)
      this.errorMessage = "Error rendering page " + pageNumber
    }
  }

  private loadParameters() {
    this.paramService.getParameters().subscribe(({ items }) => {
      this.parameters = items
    })
  }

  private loadSavedPlaceholders() {
    this.placeholderService.loadPlaceholders().subscribe((placeholders) => {
      this.placeholders = placeholders
    })
  }

  // File upload methods
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement
    if (input.files && input.files.length > 0) {
      this.readPdfFile(input.files[0])
    }
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click()
  }

  // Drag and drop methods for file upload
  onFileDragOver(event: DragEvent) {
    event.preventDefault()
    this.isDraggingFile = true
  }

  onFileDragLeave(event: DragEvent) {
    event.preventDefault()
    this.isDraggingFile = false
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault()
    this.isDraggingFile = false

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0]
      if (file.type === "application/pdf") {
        this.readPdfFile(file)
      } else {
        this.errorMessage = "Please upload a PDF file."
      }
    }
  }

  private readPdfFile(file: File) {
    this.isLoading = true
    this.errorMessage = ""

    const reader = new FileReader()

    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target?.result instanceof ArrayBuffer) {
        this.placeholderService.setPdfData(e.target.result)
      } else {
        this.errorMessage = "Failed to read the PDF file."
        this.isLoading = false
      }
    }

    reader.onerror = () => {
      this.errorMessage = "Error reading the file."
      this.isLoading = false
    }

    reader.readAsArrayBuffer(file)
  }

  // Clear the current PDF and placeholders
  clearPdf() {
    this.placeholderService.clearAll()
    this.placeholders = []
    if (this.fileInput) {
      this.fileInput.nativeElement.value = ""
    }
  }

  // Parameter drag and drop methods
  onParameterDrop(event: DragEvent) {
    event.preventDefault()
    if (!event.dataTransfer || !this.pdfLoaded) return

    try {
      const param = JSON.parse(event.dataTransfer.getData("text"))
      const rect = this.canvas.nativeElement.getBoundingClientRect()

      const placeholder = {
        ...param,
        x: (event.clientX - rect.left) / this.scale,
        y: (event.clientY - rect.top) / this.scale,
        page: this.currentPage,
      }

      this.placeholders = this.placeholders.filter(
        (p) => p.idParametro !== param.idParametro || p.page !== this.currentPage,
      )

      this.placeholders.push(placeholder)
      this.placeholderService.savePlaceholders(this.placeholders).subscribe()
    } catch (error) {
      console.error("Error processing drop:", error)
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault()
  }

  showCoordinates() {
    console.log("Placeholders:", this.placeholders)
    alert(JSON.stringify(this.placeholders))
  }

  dragStart(event: DragEvent, param: any) {
    if (!event.dataTransfer) return
    event.dataTransfer.setData("text", JSON.stringify(param))
    event.dataTransfer.effectAllowed = "move"
  }

  async nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++
      const pdfData = await firstValueFrom(this.placeholderService.getPdfData())
      if (pdfData) {
        const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise
        this.renderPage(pdf, this.currentPage)
      }
    }
  }

  async prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--
      const pdfData = await firstValueFrom(this.placeholderService.getPdfData())
      if (pdfData) {
        const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise
        this.renderPage(pdf, this.currentPage)
      }
    }
  }

  async zoomIn() {
    this.scale += 0.1
    const pdfData = await firstValueFrom(this.placeholderService.getPdfData())
    if (pdfData) {
      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise
      this.renderPage(pdf, this.currentPage)
    }
  }

  async zoomOut() {
    if (this.scale > 0.5) {
      this.scale -= 0.1
      const pdfData = await firstValueFrom(this.placeholderService.getPdfData())
      if (pdfData) {
        const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise
        this.renderPage(pdf, this.currentPage)
      }
    }
  }
}
