import { ObservableValue, ReadonlyObservableValue } from "ergo-hex";
import { VirtualizedScrollerDomain } from "../scroller/virtualized_scroller_domain";

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

  constructor(dateHeight: number) {
    this._dateHeight = dateHeight;

    this.scrollerDomain.disableX();
  }

  scrollerDomain = new VirtualizedScrollerDomain(
    requestAnimationFrame,
    cancelAnimationFrame
  );

  selectDateRange(range: DateRange) {
    this._selection.setValue(range);
  }
}
