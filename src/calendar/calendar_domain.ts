import { ObservableValue, ReadonlyObservableValue } from "ergo-hex";
import { ScrollDomain } from "../scroll/scroll_domain";
import { SnapScrollDomain } from "../scroll/snap_scroll_domain";

interface DateRange {
  start: Date;
  end: Date;
}

export class CalendarDomain {
  private _today = new Date();
  private _dateHeight: number;
  private _selection = new ObservableValue<DateRange>({
    start: this._today,
    end: this._today,
  });

  get today() {
    return this._today;
  }

  get selectionBroadcast(): ReadonlyObservableValue<DateRange> {
    return this._selection;
  }

  get dateHeight() {
    return this._dateHeight;
  }

  scrollDomain: SnapScrollDomain;

  constructor(dateHeight: number) {
    this._dateHeight = dateHeight;
    this.scrollDomain = new SnapScrollDomain(this._dateHeight);
    this.scrollDomain.disableX();
  }

  selectDateRange(range: DateRange) {
    this._selection.setValue(range);
  }
}
