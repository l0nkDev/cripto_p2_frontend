import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet, RouterLinkWithHref, RouterLink } from '@angular/router';
import { EdgeToEdge } from '@capawesome/capacitor-android-edge-to-edge-support';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [RouterOutlet, RouterLinkWithHref, RouterLink]
})
export class App implements OnInit{
  protected readonly title = signal('cripto_p2_frontend');

  ngOnInit(): void {
    EdgeToEdge.enable();
  }
}
