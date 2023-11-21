function setupIsotope() {
    var $grid = $('.grid').isotope({
        itemSelector: '.library-item',
        layoutMode: 'fitRows'
    });

    // bind filter button click
    $('.filters-button-group').on('click', 'button', function () {
        var filterValue = $(this).attr('data-filter');
        // use filterFn if matches value
        filterValue = filterValue;
        $grid.isotope({ filter: filterValue });
    });

    // change is-checked class on buttons
    $('.button-group').each(function (i, buttonGroup) {
        var $buttonGroup = $(buttonGroup);
        $buttonGroup.on('click', 'button', function () {
            $buttonGroup.find('.is-checked').removeClass('is-checked');
            $(this).addClass('is-checked');
        });
    });

}

function setupItemClickEvents() {
    $('.library-item').click(function () {
        var $button = $(this);
        var id = $button.data("id");
        var url = "/Library/Details/" + id;
        var win = window.open(url, '_blank');
        win.focus();
    });
}