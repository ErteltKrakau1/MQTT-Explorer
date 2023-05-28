import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopicSearchComponent } from './topic-search.component';

describe('TopicSearchComponent', () => {
  let component: TopicSearchComponent;
  let fixture: ComponentFixture<TopicSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TopicSearchComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopicSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
