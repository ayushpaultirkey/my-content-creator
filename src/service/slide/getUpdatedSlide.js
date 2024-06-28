export default function GetUpdatedSlide(originalSlides = [], newSlides = []) {

    // Create object to store updated slides
    const _update = { updated: [], removed: [], added: [] };
    
    // Create original map for the slides
    const _originalMap = new Map(originalSlides.map(slide => [slide.id, slide]));

    // Check for any updates and additions
    newSlides.forEach(newSlide => {

        const _originalSlide = _originalMap.get(newSlide.id);
        if(_originalSlide) {

            // Check if content has changed
            if(JSON.stringify(_originalSlide) !== JSON.stringify(newSlide)) {
                _update.updated.push(newSlide);
            };

            // Remove from map to keep track of remaining slides
            _originalMap.delete(newSlide.id);

        }
        else {
            _originalMap.added.push(newSlide);
        };

    });

    // Remaining slides in originalMap are considered removed
    _update.removed = Array.from(_originalMap.values());

    return _update;

}