import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-event-stats',
  templateUrl: './event-stats.component.html',
  styleUrls: ['./event-stats.component.scss']
})
export class EventStatsComponent implements OnInit {
  @Input() stats;

  constructor() {
  }

  ngOnInit() {
  }
}
