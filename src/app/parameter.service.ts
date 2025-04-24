import { Injectable } from "@angular/core"
import { type Observable, of } from "rxjs"

@Injectable({ providedIn: "root" })
export class ParameterService {
  private parameters = [
    { idParametro: 480, descrizione: "RAPINA", valore: "X" },
    { idParametro: 481, descrizione: "CAUSAL_G00", valore: "X" },
    { idParametro: 482, descrizione: "A", valore: "A" },
    { idParametro: 483, descrizione: "POSTA_REGISTRATA", valore: "X" },
    // Add more parameters as needed
    { idParametro: 484, descrizione: "FIRMA", valore: "X" },
    { idParametro: 485, descrizione: "DATA", valore: "X" },
    { idParametro: 486, descrizione: "NOME", valore: "X" },
    { idParametro: 487, descrizione: "COGNOME", valore: "X" },
    { idParametro: 488, descrizione: "INDIRIZZO", valore: "X" },
    { idParametro: 489, descrizione: "CITTÀ", valore: "X" },
    { idParametro: 490, descrizione: "CAP", valore: "X" },
    { idParametro: 491, descrizione: "PROVINCIA", valore: "X" },
    { idParametro: 492, descrizione: "TELEFONO", valore: "X" },
    { idParametro: 493, descrizione: "EMAIL", valore: "X" },
  ]

  getParameters(page = 0, pageSize = 25): Observable<any> {
    const start = page * pageSize
    const end = start + pageSize
    return of({
      items: this.parameters.slice(start, end),
      total: this.parameters.length,
    })
  }
}
