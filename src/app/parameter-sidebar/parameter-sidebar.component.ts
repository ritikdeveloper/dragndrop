import { Component, Input } from "@angular/core"

@Component({
  selector: "app-parameter-sidebar",
  templateUrl: "./parameter-sidebar.component.html",
  styleUrls: ["./parameter-sidebar.component.scss"],
})
export class ParameterSidebarComponent {
  @Input() parameters: any[] = []
  currentPage = 0
  itemsPerPage = 25

  get paginatedParameters() {
    const start = this.currentPage * this.itemsPerPage
    return this.parameters.slice(start, start + this.itemsPerPage)
  }

  changePage(delta: number) {
    this.currentPage = Math.max(
      0,
      Math.min(this.currentPage + delta, Math.ceil(this.parameters.length / this.itemsPerPage) - 1),
    )
  }

  onDragStart(event: DragEvent, param: any) {
    if (!event.dataTransfer) return
    event.dataTransfer.setData("text", JSON.stringify(param))
    event.dataTransfer.effectAllowed = "move"
  }
}
