
function calculate(sourcedata,uri) {
    //$('.ajax_spinner').show();
    var updateModelValues = JSON.stringify(sourcedata.InputValues);
    $.ajax({
        type: "POST",
        url: uri,
        traditional: true,
        contentType: 'application/json; charset=utf-8',
        data: updateModelValues,
        success: function(results) {
            if (results.success) {
                sourcedata.Outputs = results.outputs;
                generateOutputsUI();
                $(".loading-message").hide();
                $(".analysis-content").addClass("analysis-content-ready");
            } else {
                var html = "<div style='margin-top: 40px; '><p style='text-align: center; font-size: 1.4em; color: red'><i class='fa fa-exclamation-circle fa-3x'></i><br/>Oh-no!! Something went wrong.</p><p style='text-align:center; font-size: 1.0em; '>We weren't able to run this analysis.</p><p style='text-align:center;'>Try again later - looks like trouble connecting to the climate data server.</p></div>";
                $(".loading-message").html(html);
            }
            $('.ajax_spinner').hide();
        }
    });
}