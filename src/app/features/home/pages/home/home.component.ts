import { Component, inject, OnInit, signal } from '@angular/core';
import { DeckPreviewDto } from '../../../decks/models/deck.model';
import { AlbumDto } from '../../../albums/models/album.model';
import { DeckService } from '../../../decks/services/deck.service';
import { AlbumService } from '../../../albums/services/album.service';
import { DeckPreviewComponent } from '../../../decks/components/deck-card/deck-preview.component';
import { AlbumPreviewComponent } from '../../../albums/components/album-preview/album-preview.component';

@Component({
  selector: 'app-home',
  imports: [DeckPreviewComponent, AlbumPreviewComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private readonly deckService = inject(DeckService);
  private readonly albumService = inject(AlbumService);

  readonly decks = signal<DeckPreviewDto[]>([]);
  readonly albums = signal<AlbumDto[]>([]);

  ngOnInit(): void {
    this.deckService.getPublicDecks({}, 0, 10).subscribe({
      next: (page) => this.decks.set(page.content),
    });
    this.albumService.getPublicAlbums({}, 0, 10).subscribe({
      next: (page) => this.albums.set(page.content),
    });
  }
}
