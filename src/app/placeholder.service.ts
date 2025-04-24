import { Injectable } from "@angular/core"
import { type Observable, of, BehaviorSubject } from "rxjs"

@Injectable({ providedIn: "root" })
export class PlaceholderService {
  private readonly STORAGE_KEY = "pdf-placeholders"
  private pdfDataSubject = new BehaviorSubject<ArrayBuffer | null>(null)

  // Observable for components to subscribe to PDF data changes
  public pdfData$ = this.pdfDataSubject.asObservable()

  // Method to set PDF data from file upload
  setPdfData(data: ArrayBuffer): void {
    this.pdfDataSubject.next(data)
  }

  // Method to check if PDF is loaded
  isPdfLoaded(): boolean {
    return this.pdfDataSubject.value !== null
  }

  // Method to get current PDF data
  getPdfData(): Observable<ArrayBuffer | null> {
    return of(this.pdfDataSubject.value)
  }

  savePlaceholders(placeholders: any[]): Observable<boolean> {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(placeholders))
    return of(true)
  }

  loadPlaceholders(): Observable<any[]> {
    const saved = localStorage.getItem(this.STORAGE_KEY)
    return of(saved ? JSON.parse(saved) : [])
  }

  // Clear all data (PDF and placeholders)
  clearAll(): void {
    localStorage.removeItem(this.STORAGE_KEY)
    this.pdfDataSubject.next(null)
  }
}
