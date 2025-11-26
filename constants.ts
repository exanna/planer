import { Template, TemplateCategory, DayType } from './types';

export const WEEKDAYS = ['PON', 'WT', 'ŚR', 'CZW', 'PT', 'SOB', 'NDZ'];
export const MONTHS = [
  'STYCZEŃ', 'LUTY', 'MARZEC', 'KWIECIEŃ', 'MAJ', 'CZERWIEC', 
  'LIPIEC', 'SIERPIEŃ', 'WRZESIEŃ', 'PAŹDZIERNIK', 'LISTOPAD', 'GRUDZIEŃ'
];

export const INITIAL_CATEGORIES: TemplateCategory[] = [
  {
    id: 'cat_work',
    name: 'PRACA',
    baseType: DayType.WORK,
    color: 'cyber-red'
  },
  {
    id: 'cat_home',
    name: 'DZIEŃ WOLNY',
    baseType: DayType.OFF,
    color: 'cyber-blue'
  },
  {
    id: 'cat_dev',
    name: 'ROZWÓJ',
    baseType: DayType.WORK,
    color: 'cyber-yellow'
  }
];

export const INITIAL_TEMPLATES: Template[] = [
  {
    id: 'tpl_1',
    name: 'PRACA STANDARD',
    categoryId: 'cat_work',
    items: [
      { id: '1', startTime: '07:00', endTime: '08:00', activity: 'Pobudka / Toaleta' },
      { id: '2', startTime: '08:00', endTime: '10:00', activity: 'Sprawdzanie maili / Kawa' },
      { id: '3', startTime: '10:00', endTime: '13:00', activity: 'Głęboka praca (Skupienie)' },
      { id: '4', startTime: '13:00', endTime: '13:45', activity: 'Przerwa obiadowa' },
      { id: '5', startTime: '13:45', endTime: '16:00', activity: 'Spotkania / Praca bieżąca' },
      { id: '6', startTime: '16:00', endTime: '17:00', activity: 'Powrót do domu' },
      { id: '7', startTime: '18:00', endTime: '19:30', activity: 'Trening / Spacer' },
      { id: '8', startTime: '22:00', endTime: '23:00', activity: 'Wieczorny odpoczynek' },
    ]
  },
  {
    id: 'tpl_2',
    name: 'WEEKEND NA LUZIE',
    categoryId: 'cat_home',
    items: [
      { id: '1', startTime: '09:00', endTime: '10:00', activity: 'Pobudka bez budzika' },
      { id: '2', startTime: '10:00', endTime: '12:00', activity: 'Śniadanie / Rodzina' },
      { id: '3', startTime: '12:00', endTime: '15:00', activity: 'Czas wolny / Hobby' },
      { id: '4', startTime: '15:00', endTime: '16:00', activity: 'Obiad' },
      { id: '5', startTime: '20:00', endTime: '23:00', activity: 'Film / Serial' },
    ]
  }
];