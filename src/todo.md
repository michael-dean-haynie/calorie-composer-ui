pu@ save food form draft as actual, discard changes
    - these probably will re-direct to higher level food page


* Wish List
    - Delete confirmation popup modal
    - use chips for search page
    - auto focus forms in expansion panels when they open.
    - be able to hit enter on last form control in expansion panel and "complete the form"
    - add ability to go back to nothing selected for unit dropdowns
    - add banner to food form indicating that you are viewing a working draft, hit cancel to discard, hit save save draft as actual, or click somewhere to see actual details page
    - add ability to quickly jump to unit management to add unit and then come back
    - animate macro-breakdown table visual indicators in sync with pie chart
    - add sticky footer to nutrients table in food-details indicating the number of nutrients
    - from food-details page be able to do easy unit/amount conversions


* Testing
    - once units and foods and combo foods are worked out, test updating a unit on a food and expected results with combo foods.


DONT FORGET TO
- make sure conversion ratios can't have amounts of zero. That makes no sense and would probably bork the calculations.
- make error messages for contradictions use correct constituent type translations
    - same for constituentsSizeMustBeConvertableToAllOtherDefinedUnits
- double check that null/empty fields on updates actually go through
- make sure users can't create units with same abbreviation as units that they can't manage (maybe also make column unique
- make sure users can't delete units that would mess with existing stuff.

        