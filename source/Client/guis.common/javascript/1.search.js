/* 
 * Sidebar: File Search
 */
GUI.search = new function () {

    this.init = function () {
        var that = GUI.search;

        var span = $("<span>");
        this.content = $("#span");

        $("#searchButton").click(function () {

            var inventory = Modules.ObjectManager.getInventory();

            for (var i in inventory) {
                var candidate = inventory[i];

                if (candidate.getAttribute('type') == 'File') {

                    candidate.setAttribute('visible', false);

                    if (candidate.getAttribute('name').indexOf($("#searchFileId").val()) >= 0) {

                        candidate.setAttribute('visible', true);

                    }
                }
            }
        });

        $("#resetButton").click(function () {

            var inventory = Modules.ObjectManager.getInventory();
            $("#searchFileId").val('');

            for (var i in inventory) {
                var candidate = inventory[i];
                if (candidate.getAttribute('type') == 'File') {
                    candidate.setAttribute('visible', false);
                    if (candidate.getAttribute('name').indexOf($("#searchFileId").val()) >= 0) {
                        candidate.setAttribute('visible', true);
                    }
                }
            }
        });

        $("#primButton").click(function () {
            var array = [];
            var array2 = [];

            var uniqueArray = [];
            $("#Sec_tag").empty();
            $("#filterButton").empty();

            $("#Sec_tag span").empty();
            $("#title_Sec_tag").empty();
            var setTitle = true;
            var inventory = Modules.ObjectManager.getInventory();

            for (var i in inventory) {
                var candidate = inventory[i];

                if (candidate.getAttribute('type') == 'File') {

                    candidate.setAttribute('visible', false);
                    if (candidate.getAttribute('mainTag').indexOf($("#primButton").val()) >= 0) {
                        array.push(candidate.getAttribute('secondaryTags'));
                        if ($("#primButton").val() != " " && setTitle == true) {
                            var spanTitle = $("<span >");
                            spanTitle.html("Filter By Secondary Tag - " + candidate.getAttribute('mainTag') + "");
                            spanTitle.addClass("jDesktopInspector_pageHead");
                            $("#title_Sec_tag").append(spanTitle);
                            $("#title_Sec_tag").append("<br>");

                            var filterButton = $("<input >");
                            filterButton.attr({

                                type: "Button",
                                value: "Remove Filter"
                            });

                            $("#filterButton").append(filterButton);
                            setTitle = false;
                        }


                        candidate.setAttribute('visible', true);
                    }
                }
            }

            $.each(array, function (j) {
                array2 = array[j]
                $.each(array2, function (k) {
                    uniqueArray.push(array2[k]);

                });
            });
            uniqueArray = GetUnique(uniqueArray);
            if ($("#primButton").val() != " ") {
                var select = $("<select>");

                select.attr({
                    size: 5,
                    name: "select-secondary-tag",
                    multiple: "multiple",
                    title: "Select",
                    id: "select"

                });
                $.each(uniqueArray, function (m) {

                    addSecTags(select, uniqueArray[m]);

                });
            }


        });

        function GetUnique(inputArray) {
            var outputArray = [];
            for (var i = 0; i < inputArray.length; i++) {
                if ((jQuery.inArray(inputArray[i], outputArray)) == -1) {
                    outputArray.push(inputArray[i]);
                }
            }
            return outputArray;
        }

        function addSecTags(select, secTags) {


            var option = $("<option>");
            option.attr({
                value: secTags,
                id: secTags,
            });
            option.html(secTags);
            select.append(option);

            $("#Sec_tag").append(select);
        }
        $("#filterButton").click(function () {
            var size = $("#select")[0].selectedOptions.length;
            var filterArray = [];

            for (var z = 0; z < size; z++) {
                filterArray.push($("#select")[0].selectedOptions[z].text);
            }
            var visible = true;
            var matchVisible = true;

            var inventory = Modules.ObjectManager.getInventory();

            for (var i in inventory) {
                var candidate = inventory[i];
                if (candidate.getAttribute('type') == 'File') {
                    if (candidate.getAttribute('mainTag').indexOf($("#primButton").val()) >= 0) {
                        visible = candidate.getAttribute('visible');
                        matchVisible = matchArrays(candidate.getAttribute('secondaryTags'), filterArray);


                        if ((visible || matchVisible) == true) {

                            candidate.setAttribute('visible', matchVisible);
                        }
                    }
                }
            }




        });




        function matchArrays(arrayA, arrayB) {

            var matchedValues = 0;
            for (var i = 0; i < arrayA.length; i++) {
                for (var j = 0; j < arrayB.length; j++) {
                    // we can now compare each value in arrayA to each value in arrayB

                    if (arrayA[i] == arrayB[j]) {
                        matchedValues++;
                        // no point continuing once we've confirmed there's a match...
                        break;
                    }
                }
            }
            // check if the arrays are 'equal'
            if (matchedValues == arrayA.length) {
                return false;
            } else {
                return true;
            }
        }

    };

}