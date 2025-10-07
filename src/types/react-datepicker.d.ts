declare module 'react-datepicker' {
    import * as React from 'react';
    export interface ReactDatePickerProps {
        selected?: Date | null;
        onChange?: (date: Date | null) => void;
        showTimeSelect?: boolean;
        timeIntervals?: number;
        dateFormat?: string;
        placeholderText?: string;
        className?: string;
        // add other props as needed
    }
    const DatePicker: React.FC<ReactDatePickerProps>;
    export default DatePicker;
}


