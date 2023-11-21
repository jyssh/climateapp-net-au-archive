function openFeedbackDialog(analysisName, analysisId) {

    $('#feedback-dialog').dialog({
        resizable: true,
        height: 520,
        width: 600,
        modal: true,

        open: function () {
        },
        buttons: {
            Cancel: function () {
                $(this).dialog("close");
            },
            Ok: function () {
                $('.ajax_spinner').show();
                var results = new Object();
                results.messageBody = $("#user-feedback-text").val();
                results.analysisName = analysisName;
                results.analysisId =  analysisId;


                var feedback = JSON.stringify(results);
                $.ajax({
                    type: "POST",
                    url: "Analyses/SendFeedback",
                    traditional: true,
                    contentType: 'application/json; charset=utf-8',
                    data: feedback ,
                    dataType: "json",
                    success: function (results) {
                        $('.ajax_spinner').hide();
                        $('#feedback-dialog').dialog("close");
                        if (results.success) {

                            alert("Thanks for your feedback!");
                        }
                        else {
                            alert("Oh no! - couldn't send these comments...");
                        }

                    },
                    error: function (data) {
                        $('.ajax_spinner').hide();
                        alert("Oh no! - couldn't send these comments...");
                        $('#feedback-dialog').dialog("close");
                    }
                });
          }

        }
    });
}