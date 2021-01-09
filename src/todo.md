* move along, move along


* Wish List
    - Delete confirmation popup modal
    - use chips for search page
    - auto focus forms in expansion panels when they open.
    - be able to hit enter on last form control in expansion panel and "complete the form"
    - add ability to go back to nothing selected for unit dropdowns


* Testing
    - once units and foods and combo foods are worked out, test updating a unit on a food and expected results with combo foods.


pu@
- units overhaul
    - What?
        - making units referencable so labels can changes without breaking composed data structures
        - make it easier for the user to manage custom units
            - specify single/plural labels
            - re-use across foods
        - make unit input less confusing by making custom units a little more manual.
    - How?
        - API
            + Add unit table
            + integrate unit entities into other entities (no combo food yet, just food level)
            + get seeding working and endpoints working
            + get karate tests working
        - UI
            + Might want to clean up cruft first
            - Update dtos, models, mappers (everything will break)
            - rebuild business logic with tdd
            - food-form ui
                - when adding unit need plus icon to add custom unit (takes you to the units management page)
                - need to be able to save the food in draft form
                - need to build the side menue
                - need to build the units management page
                - need to be able to re-direct easily and clearly to the user

- units data solution
    - database entities know about units so they are referenceable. Other than that the backend is stupid about units. No conversion knowledge.
    - frontend needs a unit model/dto as well as in interface for the unit library


- start back on combo foods
    + fix karate tests for display units
    - fix karate test for combo-foods
        - Update combofood schemas
        - get create part of feature working.


DONT FORGET TO
- make sure conversion ratios can't have amounts of zero. That makes no sense and would probably bork the calculations.
- make error messages for contradictions use correct constituent type translations
    - same for constituentsSizeMustBeConvertableToAllOtherDefinedUnits
- double check that null/empty fields on updates actually go through
- make sure users can't create units with same abbreviation as units that they can't manage (maybe also make column unique

        