var titles = ["Sentiment: ", "Subjectivity: ", "Negative: ", "Neutral: ", "Positive: "];

function sendShit() {
    var email = $("#input").val();

    var payload = {
        "input": email
    };
    $.ajax({
        type: 'POST',
        // make sure you respect the same origin policy with this url:
        // http://en.wikipedia.org/wiki/Same_origin_policy
        url: "/doShit/",
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify({ "data": payload }),
        success: function(msg) {
            var count = 0;
            $('#paragraph_text_output').val("");
            $(Object.values(msg.prediction)).each(function() {
                if (count > 1) {
                    $('#paragraph_text_output').val($('#paragraph_text_output').val() + titles[count] + Math.round(this * 100, 2) + "% \n");
                } else {
                    $('#paragraph_text_output').val($('#paragraph_text_output').val() + titles[count] + Math.round(this, 2) + "\n");
                }
                count += 1;
            });
        }
    });
}