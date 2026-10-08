import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-back-link',
  imports: [RouterLink],
  templateUrl: './back-link.html',
  styleUrl: './back-link.scss',
})
export class BackLink {
  readonly link = input.required<string>();
  readonly label = input('Retour');
}
