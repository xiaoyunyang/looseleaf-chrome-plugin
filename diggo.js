var Bg = chrome.extension.getBackgroundPage();
chrome.tabs.getSelected(null , function(o) {
    chrome.tabs.sendRequest(o.id, {
        name: "checkVersion"
    })
});
var popCtx;
$(document).ready(function() {
    function o(a) {
        var b = /\.?diigo\./i.test(a);
        console.log("isDiigoURL", b);
        if (b)
            if (/\/item\/pdf/i.test(a))
                return false;
            else if (/^https?:\/\/chrome\.google\.com\/(extensions|webstore)/i.test(a))
                return false;
        return true
    }
    function L(a) {
        if (u !== true) {
            console.log("updateBookmark", a);
            if (a.generated == true) {
                var b = a.bm;
                a.unread === true && $("#read-later").addClass("unread").text("Mark as Read");
                $("#onload").hide();
                if (b.saved == true) {
                    $("#remove").show();
                    $("#remove").attr("data-gtooltip", "Saved " + b.datetime + ". Click to remove");
                    $("#bookmark-save").text("Edit").addClass("saved");
                    $("#cached").show().unbind("click").bind("click", function() {
                        chrome.tabs.getSelected(null , function(c) {
                            var e = "https://www.diigo.com/cached?url=" + encodeURIComponent(c.url);
                            chrome.tabs.create({
                                url: e,
                                index: c.index + 1
                            })
                        })
                    })
                }
                if (b != undefined) {
                    $("#diigobm-title-input").val(b.title);
                    $("#diigobm-url-input").val(b.url)
                } else
                    chrome.tabs.getSelected(function(c) {
                        $("#diigobm-title-input").val(c.title);
                        $("#diigobm-url-input").val(c.url)
                    });
                b.mode == 2 && $("#op-private").find(".op-checkbox-container").addClass("checked");
                b.unread == true && $("#op-readlater").find(".op-checkbox-container").addClass("checked");
                a = ParseTags.unparseTags(b.tags);
                console.log(a);
                blank(a) || $("#diigobm-tag-input").val(a + " ")
            }
        }
    }
    function v(a, b) {
        var c = $("#diigobm-tag-input")
          , e = ParseTags.parseTags(c.val(), true)
          , d = $.inArray(a, e);
        if (b === undefined)
            d >= 0 ? e.splice(d, 1) : e.push(a);
        else if (b)
            d == -1 && e.push(a);
        else
            d >= 0 && e.splice(d, 1);
        e = ParseTags.unparseTags(e);
        if (e.length)
            e += " ";
        c.val(e);
        M(c[0]);
        p()
    }
    function p() {
        var a = $("#diigobm-tag-input")
          , b = ParseTags.parseTags(a.val(), true);
        $("#tag-cloud-container").find(".Diigo-Bookmark-Tag-item").each(function() {
            var c = $(this)
              , e = c.text();
            $.inArray(e, b) != -1 ? c.addClass("selected") : c.removeClass("selected")
        });
        $("#diigobm-recent-tag, #diigobm-recommend-tag, #diigobm-group-tag").find(".diigo-tag").each(function() {
            var c = $(this)
              , e = c.text();
            console.log(e, b);
            $.inArray(e, b) != -1 ? c.addClass("selected") : c.removeClass("selected")
        })
    }
    function M(a) {
        var b = a.value.length;
        setTimeout(function() {
            a.focus();
            if (a.createTextRange) {
                var c = a.createTextRange();
                c.move("character", b);
                c.select()
            } else if (a.selectionStart >= 0) {
                a.focus();
                a.setSelectionRange(b, b)
            }
        }, 13)
    }
    function q(a, b) {
        for (var c = document.createDocumentFragment(), e = 0; e < b.length; e++) {
            var d = document.createElement("div");
            d.className = "diigo-tag";
            d.innerText = b[e];
            $(d).toggleClass("selected", $.inArray(b[e], popCtx.bm.tags) >= 0).toggleClass("inused", $.inArray(b[e], popCtx.mytag) >= 0);
            c.appendChild(d)
        }
        if (a == "recommended")
            $(c).appendTo($("#diigobm-recommend-tag").show());
        else if (a == "group") {
            $("#diigobm-group-tag").find(".loading").hide();
            $("#diigobm-group-tag").find(".diigo-tag").remove();
            $(c).appendTo($("#diigobm-group-tag"))
        }
    }
    function C(a) {
        return some(popCtx.bm.lists, function(b) {
            return b.id == a
        })
    }
    function D(a) {
        return some(popCtx.bm.groups, function(b) {
            return b.name == a
        })
    }
    function E(a) {
        return /^(https|http|ftp|rtsp|mms)+:\/\//.test(a) ? true : false
    }
    function F() {
        var a = true
          , b = $("#diigobm-url-input").val();
        if ($("#diigobm-title-input").val().match(/^\s*$/)) {
            a = false;
            $("#diigobm-title").find(".diigo-alert-tip").show()
        }
        if (!E(b) || b.match(/^\s*$/))
            if (a == true) {
                a = false;
                $("#diigobm-url").find(".diigo-alert-tip").show()
            }
        if (a != false) {
            a = {};
            a.title = $("#diigobm-title-input").val();
            if (a.title.match(/^\s*$/))
                a.title = popCtx.bm.title;
            a.url = $("#diigobm-url-input").val();
            if (a.url.match(/^\s*$/) || !E(a.url))
                a.url = popCtx.bm.url;
            a.description = $("#diigobm-des-input").val();
            a.tags = ParseTags.parseTags($("#diigobm-tag-input").val(), true);
            a.mode = $("#op-private").find(".op-checkbox-container").hasClass("checked") ? 2 : 0;
            a.unread = $("#op-readlater").find(".op-checkbox-container").hasClass("checked") ? true : false;
            b = $("#diigobm-list").find("select").val();
            a.shareLists = b == -1 || b == -2 || b == 0 ? [] : [b];
            b = $("#diigobm-group").find("select").val();
            a.shareGroups = b == -1 || b == -2 || b == 0 ? [] : [b];
            a.shareAnnotations = $("#Diigo-Bookmark-checkShareExisting").find(".op-checkbox-container").hasClass("checked") ? true : false;
            a.cache = $("#op-cache").find(".op-checkbox-container").hasClass("checked") ? true : false;
            var c = {
                url: a.url,
                mode: a.mode,
                title: a.title,
                tags: a.tags,
                description: a.description,
                unread: a.unread,
                urlId: popCtx.bm.urlId,
                cache: a.cache,
                groups: a.shareGroups,
                shareExistingAnnotations: a.shareAnnotations,
                lists: a.shareLists
            };
            chrome.tabs.getSelected(null , function(e) {
                c.tabId = e.id;
                j.WebAPI.saveBookmark(c);
                window.close()
            })
        }
    }
    function N(a) {
        var b = [];
        a.sort(function(h, g) {
            return h.count <= g.count ? 1 : -1
        });
        a = a.slice(0, 101);
        var c = a[0].count
          , e = a.length;
        a.sort(function(h, g) {
            return h.name.toLowerCase() <= g.name.toLowerCase() ? -1 : 1
        });
        for (var d = 0; d < e; d++)
            b[d] = a[d].count;
        b = arrayUnique(b);
        e = b.length;
        b.sort(function(h, g) {
            return h < g ? 1 : -1
        });
        var f = Math.ceil(e / 10);
        e = b.slice(1, 1 + f);
        d = b.slice(1 + f, 1 + 2 * f);
        b = b.slice(1 + 2 * f, 1 + 3 * f);
        return {
            topTags: a,
            maxCount: c,
            first: e,
            second: d,
            third: b
        }
    }
    function G(a) {
        if (a.length == 0) {
            var b = document.getElementById("tag-cloud-container");
            a = document.createElement("div");
            a.id = "no-tag";
            a.innerHTML = "You haven't create any tags yet,:)";
            b.appendChild(a)
        } else if (!($("#tag-cloud-container").find("a").length > 0)) {
            var c = N(a);
            b = c.topTags;
            var e = c.maxCount;
            a = c.first;
            var d = c.second
              , f = c.third
              , h = b.length;
            c = document.createDocumentFragment();
            for (var g = 0; g < h; g++) {
                var i = document.createElement("a");
                i.className = "Diigo-Bookmark-Tag-item";
                i.href = "#";
                i.innerText = b[g].name;
                var k = b[g].count;
                if (k == e) {
                    i.style.fontSize = "20px";
                    i.style.fontWeight = "bold"
                }
                a.forEach(function(l) {
                    if (k == l) {
                        i.style.fontSize = "18px";
                        i.style.fontWeight = "bold"
                    }
                });
                d.forEach(function(l) {
                    if (k == l) {
                        i.style.fontSize = "16px";
                        i.style.fontWeight = "bold"
                    }
                });
                f.forEach(function(l) {
                    if (k == l) {
                        i.style.fontSize = "16px";
                        i.style.fontWeight = "regular"
                    }
                });
                c.appendChild(i)
            }
            b = document.getElementById("tag-cloud-container");
            b.appendChild(c);
            $("#tag-cloud-container").on("click", "a", function(l) {
                /Diigo\-Bookmark\-Tag\-item/.test(l.target.className) && v($(this).text())
            })
        }
    }
    function r(a, b) {
        console.trace();
        var c = a.list
          , e = a.outliners
          , d = $("#diigobm-list").find("select").empty().unbind().removeClass("processing");
        d.append(Utils.dom.buildOne("option", {
            value: 0
        }, ["Add to an Outliner"]));
        d.append(Utils.dom.buildOne("option", {
            value: -1
        }, [Array(20).join("-")]));
        $(Utils.dom.buildOne("option", {
            value: -2
        }, ["Create an Outliner..."])).appendTo(d);
        d.append(Utils.dom.buildOne("option", {
            value: -1
        }, [Array(20).join("-")]));
        forEach(e, function(f) {
            b ? d.append(Utils.dom.buildOne("option", {
                value: f.id
            }, [f.title])) : d.append(Utils.dom.buildOne("option", {
                value: f.id
            }, [f.title + (C(f.id) ? " (added)" : "")]))
        });
        d.append(Utils.dom.buildOne("option", {
            value: -1
        }, [Array(20).join("-")]));
        if (c.length) {
            d.append(Utils.dom.buildOne("option", {
                value: -8
            }, ["Add to a List"]));
            d.append(Utils.dom.buildOne("option", {
                value: -1
            }, [Array(20).join("-")]));
            forEach(c, function(f) {
                b ? d.append(Utils.dom.buildOne("option", {
                    value: f.id
                }, [f.title])) : d.append(Utils.dom.buildOne("option", {
                    value: f.id
                }, [f.title + (C(f.id) ? " (added)" : "")]))
            })
        }
        d.append(Utils.dom.buildOne("option", {
            value: -1
        }, [Array(20).join("-")]));
        $(Utils.dom.buildOne("option", {
            value: -3
        }, ["Refresh"])).appendTo(d);
        d.change(function() {
            var f = d.val();
            if (f == -2) {
                if (j.GlobalData.permissions.createOutliner === true) {
                    $("#diigobm-list-add").show();
                    $("#diigobm-list").hide();
                    $("#diigobm-list-addInput").focus()
                } else {
                    $("#diigobm-list-add-tip").show();
                    $("#diigobm-list").hide()
                }
                d.val(0)
            } else if (f == -3) {
                $(this).addClass("processing");
                chrome.tabs.getSelected(null , function(h) {
                    chrome.tabs.sendRequest(h.id, {
                        name: "refreshMyStuff"
                    })
                });
                d.val(-1)
            }
        });
        d.val(0).change()
    }
    function w(a, b) {
        var c = a.filter(function(f) {
            return f.access_mode < 5
        })
          , e = a.filter(function(f) {
            console.log(f.access_mode);
            return f.access_mode >= 5
        })
          , d = $("#diigobm-group").find("select").empty().unbind().removeClass("processing");
        if (e.length > 0) {
            d.append(Utils.dom.buildOne("option", {
                value: 0
            }, ["Share to a Team"]));
            d.append(Utils.dom.buildOne("option", {
                value: -5
            }, [Array(20).join("-")]));
            forEach(e, function(f) {
                b ? d.append(Utils.dom.buildOne("option", {
                    value: f.name
                }, [f.displayName])) : d.append(Utils.dom.buildOne("option", {
                    value: f.name
                }, [f.displayName + (D(f.name) ? " (shared)" : "")]))
            });
            d.append(Utils.dom.buildOne("option", {
                value: -5
            }, [Array(20).join("-")]))
        }
        d.append(Utils.dom.buildOne("option", {
            value: 0
        }, ["Share to a Group"]));
        d.append(Utils.dom.buildOne("option", {
            value: -1
        }, [Array(20).join("-")]));
        $(Utils.dom.buildOne("option", {
            value: -2
        }, ["Create a Group..."])).appendTo(d);
        d.append(Utils.dom.buildOne("option", {
            value: -5
        }, [Array(20).join("-")]));
        forEach(c, function(f) {
            b ? d.append(Utils.dom.buildOne("option", {
                value: f.name
            }, [f.displayName])) : d.append(Utils.dom.buildOne("option", {
                value: f.name
            }, [f.displayName + (D(f.name) ? " (shared)" : "")]))
        });
        d.append(Utils.dom.buildOne("option", {
            value: -5
        }, [Array(20).join("-")]));
        $(Utils.dom.buildOne("option", {
            value: -3
        }, ["Refresh"])).appendTo(d);
        d.change(function() {
            var f = d.val();
            if (f == -2) {
                chrome.tabs.create({
                    url: "https://groups.diigo.com/create"
                });
                d.val(-1)
            } else if (f == -3) {
                $(this).addClass("processing");
                chrome.tabs.getSelected(null , function(h) {
                    chrome.tabs.sendRequest(h.id, {
                        name: "refreshMyStuff"
                    })
                });
                d.val(-1)
            }
            if (f != 0 && f != -1 && f != -2 && f != -3) {
                $("#diigosc-group-tag").show();
                popCtx.isAnnotated && $("#bottom").find("div:first-child").show();
                console.log(popCtx);
                if (popCtx.groupTagsDict[f] != undefined)
                    q("group", popCtx.groupTagsDict[f]);
                else {
                    $("#diigobm-group-tag").show();
                    chrome.tabs.getSelected(null , function(h) {
                        chrome.tabs.sendRequest(h.id, {
                            name: "loadGroupTagsDictionary",
                            groupName: f
                        })
                    })
                }
            }
        });
        d.val(0).change()
    }
    function H(a) {
        console.log(a);
        var b = a.bm;
        a.generated === true && $("#onload").hide();
        if (b.saved == true) {
            $("#remove").show();
            $("#top-bar").find(".top-bar-title").text("Edit bookmark")
        }
        $("#remove").attr("data-gtooltip", "Saved " + b.datetime + ". Click to remove");
        if (b != undefined) {
            $("#diigobm-title-input").val(b.title);
            $("#diigobm-url-input").val(b.url)
        } else
            chrome.tabs.getSelected(function(h) {
                $("#diigobm-title-input").val(h.title);
                $("#diigobm-url-input").val(h.url)
            });
        b.mode == 2 && $("#op-private").find(".op-checkbox-container").addClass("checked");
        b.unread == true && $("#op-readlater").find(".op-checkbox-container").addClass("checked");
        if (b.description.length > 0)
            $("#diigobm-des-input").text(b.description);
        else
            a.selection && $("#diigobm-des-input").text('"' + a.selection + '"');
        var c = ParseTags.unparseTags(b.tags);
        console.log(c);
        blank(c) || $("#diigobm-tag-input").val(c + " ");
        r({
            list: a.lists,
            outliners: a.outliners
        }, false);
        w(a.groups, false);
        c = a.lastUsedTags;
        if ($("#diigobm-recent-tag").find(".diigo-tag").length == 0)
            if (c.length > 0) {
                for (var e = document.createDocumentFragment(), d = 0; d < c.length; d++) {
                    var f = document.createElement("div");
                    f.className = "diigo-tag";
                    f.innerText = c[d];
                    e.appendChild(f)
                }
                $("#diigobm-recent-tag").append(e)
            } else
                $("#diigobm-recent-tag").hide();
        p();
        $("#diigobm-recommend-tag").find(".diigo-tag").length == 0 && chrome.tabs.getSelected(null , function(h) {
            chrome.tabs.sendRequest(h.id, {
                name: "getRecommendedTags"
            })
        });
        G(a.myTagsWithCount);
        b.saved === false && chrome.storage.local.get(null , function(h) {
            if (h.researchMode === true) {
                $("#top-bar").find(".focus-research-tip").show();
                I(h)
            }
        })
    }
    function x(a, b) {
        $("#search-type").removeClass("meta full").addClass(a);
        b || (localStorage.search_type = a);
        a === "meta" ? y.enable() : y.disable();
        $("#search-input").val() != "" && z($("#search-input").val())
    }
    function O() {
        $("#search-input").on("keydown", function(d) {
            if (d.which == 13) {
                d = $("#search-input").val();
                z(d)
            }
        });
        $("#search-btn").on("click", function() {
            var d = $("#search-input").val();
            z(d)
        });
        $("#search-type").on("click", function(d) {
            d.stopPropagation();
            $("#search-type-switcher").show()
        });
        $("#search-type-switcher").on("click", "li", function() {
            $(this).hasClass("meta") ? x("meta") : x("full")
        });
        $(document).on("click", function() {
            $("#search-type-switcher").hide()
        });
        $("#viewAllLink").on("click", function() {
            var d = $(this).attr("data-href");
            chrome.tabs.create({
                url: d
            })
        });
        $("#recent-result-tab").on("click", ".result-link", function() {
            $(".result-link").removeClass("current");
            $(this).addClass("current");
            A($(this).attr("id"))
        });
        $("#recent-result-iframe").load(function() {
            $("#recent-result-tab-loading").hide()
        });
        $("#search-result-iframe").load(function() {
            $("#search-result-main").show();
            $("#search-result-loading").hide()
        });
        $("#backLink").off("click").on("click", function() {
            B("recent")
        });
        var a = JSON.parse(localStorage.lastSearch);
        if (a.tab == "recent")
            J("recent");
        else
            a.tab == "search" && J("search", a.key);
        a = j.GlobalData.myTags;
        for (var b = [], c = 0; c < a.length; c++)
            b.push(a[c]);
        b = removeFromArray("no_tag", b);
        console.log(b);
        a = {
            resultsClass: "diigolet ac_results ac_search",
            data: b,
            mode: "multiple",
            multipleSeparator: " ,",
            id: "diigolet-ac",
            moveToSelect: true
        };
        try {
            y = new AutoComplete("#search-input",a)
        } catch (e) {
            debug(e)
        }
        x(localStorage.search_type, true)
    }
    function A(a) {
        $("#recent-result-tab-loading").show();
        if (a == "recentTab")
            $("#recent-result-iframe").attr({
                src: "https://www.diigo.com/chrome/items"
            });
        else
            a == "unreadTab" && $("#recent-result-iframe").attr({
                src: "https://www.diigo.com/chrome/items?read=no"
            })
    }
    function B(a) {
        if (a === "recent") {
            $("#search-input").val("");
            $("#recent-result").addClass("current rotateSlideIn-r");
            $("#search-result").addClass("rotateSlideOut-r");
            A("recentTab");
            localStorage.lastSearch = JSON.stringify({
                tab: "recent",
                key: "null"
            });
            setTimeout(function() {
                $(".tab").removeClass("rotateSlideIn-r rotateSlideOut-r");
                $("#search-result").removeClass("current")
            }, 1E3)
        } else if (a === "search") {
            $("#search-result").addClass("current rotateSlideIn-l");
            $("#recent-result").addClass("rotateSlideOut-l");
            setTimeout(function() {
                $(".tab").removeClass("rotateSlideIn-l rotateSlideOut-l");
                $("#recent-result").removeClass("current")
            }, 1E3)
        }
    }
    function J(a, b) {
        if (a == "recent") {
            $("#recent-result").addClass("current");
            $("#search-result").removeClass("current");
            A("recentTab")
        } else if (a == "search") {
            $("#recent-result").removeClass("current");
            $("#search-result").addClass("current");
            $("#search-result-main").hide();
            $("#search-result-loading").show();
            $("#search-input").val(b);
            if (localStorage.search_type === "meta") {
                var c = "https://www.diigo.com/chrome/meta?what=" + encodeURIComponent(b);
                $("#viewAllLink").attr("data-href", "https://www.diigo.com/search?adSScope=my&what=" + encodeURIComponent(b))
            } else {
                c = "https://www.diigo.com/chrome/fulltext?what=" + encodeURIComponent(b);
                $("#viewAllLink").attr("data-href", "https://www.diigo.com/search?adSScope=my&what=" + encodeURIComponent(b) + "&snapshot=yes")
            }
            $("#search-result-iframe").attr({
                src: c
            })
        }
    }
    function z(a) {
        if (a == "")
            $("#recent-result").hasClass("current") || B("recent");
        else {
            $("#search-result").hasClass("current") || B("search");
            localStorage.lastSearch = JSON.stringify({
                tab: "search",
                key: a
            });
            $("#search-result-main").hide();
            $("#search-result-loading").show();
            if (localStorage.search_type === "meta") {
                var b = "https://www.diigo.com/chrome/meta?what=" + encodeURIComponent(a);
                $("#viewAllLink").attr("data-href", "https://www.diigo.com/search?adSScope=my&what=" + encodeURIComponent(a))
            } else {
                b = "https://www.diigo.com/chrome/fulltext?what=" + encodeURIComponent(a);
                $("#viewAllLink").attr("data-href", "https://www.diigo.com/search?adSScope=my&what=" + encodeURIComponent(a) + "&snapshot=yes")
            }
            $("#search-result-iframe").attr({
                src: b
            })
        }
    }
    function K(a) {
        var b = a.groups ? a.groups : j.GlobalData.myGroups;
        r({
            list: a.lists ? a.lists : j.GlobalData.myBmLists,
            outliners: a.outliners ? a.outliners : j.GlobalData.outliners
        }, true);
        w(b, true);
        b = a.lastUsedTags ? a.lastUsedTags : [];
        if ($("#diigobm-recent-tag").find(".diigo-tag").length == 0)
            if (b.length > 0) {
                for (var c = document.createDocumentFragment(), e = 0; e < b.length; e++) {
                    var d = document.createElement("div");
                    d.className = "diigo-tag";
                    d.innerText = b[e];
                    c.appendChild(d)
                }
                $("#diigobm-recent-tag").append(c)
            } else
                $("#diigobm-recent-tag").hide();
        G(a.myTagsWithCount ? a.myTagsWithCount : j.GlobalData.myTagsWithCount);
        chrome.storage.local.get("researchModeData", function(f) {
            if (f.researchModeData)
                I(f);
            else {
                $("#op-private").find(".op-checkbox-container").removeClass("checked");
                $("#op-readlater").find(".op-checkbox-container").removeClass("checked");
                $("#diigobm-tag-input").val("");
                $("#diigobm-list").find("select").val(0);
                $("#diigobm-group").find("select").val(0)
            }
        })
    }
    function I(a) {
        a = a.researchModeData;
        a["private"] === true ? $("#op-private").find(".op-checkbox-container").addClass("checked") : $("#op-private").find(".op-checkbox-container").removeClass("checked");
        a.unread === true && $("#op-readlater").find(".op-checkbox-container").addClass("checked");
        $("#diigobm-des-input").val(a.description);
        var b = ParseTags.unparseTags(a.tags);
        $("#diigobm-tag-input").val(b);
        p();
        a.shareLists.length && $("#diigobm-list").find("select").val(a.shareLists[0]);
        a.shareGroups.length && $("#diigobm-group").find("select").val(a.shareGroups[0])
    }
    function P() {
        var a = {};
        a.description = $("#diigobm-des-input").val();
        a.tags = ParseTags.parseTags($("#diigobm-tag-input").val(), true);
        a["private"] = $("#op-private").find(".op-checkbox-container").hasClass("checked") ? true : false;
        a.unread = $("#op-readlater").find(".op-checkbox-container").hasClass("checked") ? true : false;
        var b = $("#diigobm-list").find("select").val();
        a.shareLists = b == -1 || b == -2 || b == 0 ? [] : [b];
        b = $("#diigobm-group").find("select").val();
        a.shareGroups = b == -1 || b == -2 || b == 0 ? [] : [b];
        a.shareAnnotations = $("#Diigo-Bookmark-checkShareExisting").find(".op-checkbox-container").hasClass("checked") ? true : false;
        if (j.GlobalData.permissions.autoShowAnnotation)
            chrome.storage.local.set({
                researchModeData: a,
                researchMode: true
            }, function() {
                $("#notification").fadeIn().delay(2E3).fadeOut()
            });
        else {
            chrome.tabs.create({
                url: "researchMode.html"
            });
            window.close()
        }
    }
    function s(a) {
        $("#research-mode-notification").hide();
        if (a) {
            $("#top-bar").find("span").text("Focused Research").end().find("div").hide();
            $("#diigobm-title,#diigobm-url,#op-cache,#diigobm-recommend-tag").hide();
            chrome.storage.local.get("isShowResearchTip", function(g) {
                console.log(g);
                if (typeof g.isShowResearchTip === "undefined" || g.isShowResearchTip != false)
                    $("#research-mode-notification").show()
            });
            $("#research-mode-close-notify").on("click", function() {
                $("#research-mode-notification").hide();
                chrome.storage.local.set({
                    isShowResearhTip: false
                })
            })
        }
        var b = navigator.userAgent.toLowerCase()
          , c = b.indexOf("macintosh") != -1 || b.indexOf("mac os x") != -1;
        if (c) {
            $("#diigobm-url").addClass("mac");
            $("#list-group select").css("text-indent", "7px")
        } else
            $("#diigobm-url").addClass("win");
        $("#link-icon").on("click", function() {
            var g = $("#diigobm-url");
            if (c)
                g.toggleClass("mac-unfold");
            else
                g.hasClass("unfold") ? g.addClass("fold").removeClass("unfold") : g.addClass("unfold").removeClass("fold")
        }).Gtooltip({
            position: "top"
        });
        $("#diigobm-title-input,#diigobm-url-input").on("focus", function() {
            $(this).parent().find(".diigo-alert-tip").hide()
        }).on("input", function() {
            $(this).parent().find(".diigo-alert-tip").hide()
        });
        $("#diigobm-tag-dropdown").on("click", function() {
            $(this).toggleClass("cloud");
            if ($("#tag-cloud").css("display") == "none") {
                $("#tag-suggestion").hide();
                $("#tag-cloud").show()
            } else {
                $("#tag-suggestion").show();
                $("#tag-cloud").hide()
            }
        });
        $("#diigobm-recent-tag").on("click", "a", function() {
            $("#diigobm-recent-tag").find(".diigo-tag").each(function() {
                v($(this).addClass("selected").text(), true)
            })
        });
        $("#diigobm-options,#Diigo-Bookmark-checkShareExisting").on("click", ".op-checkbox-container", function() {
            $(this).toggleClass("checked")
        });
        $("#diigobm-title-input,#diigobm-des-input,#diigobm-tag-input").on("focus", function() {
            $(this).parent().addClass("focus")
        }).on("blur", function() {
            $(this).parent().removeClass("focus")
        });
        $("#bm-main").on("keydown", function(g) {
            if (g.keyCode == 13) {
                if (g.target.tagName.toLowerCase() != "textarea" || g.ctrlKey)
                    F()
            } else
                g.keyCode == 27 && window.close()
        });
        $("#op-cache").find(".op-checkbox-container").removeClass("checked");
        $("#remove").Gtooltip();
        b = [];
        var e = popCtx.myTagsWithCount ? popCtx.myTagsWithCount : j.GlobalData.myTagsWithCount;
        e.sort(function(g, i) {
            return g.count <= i.count ? 1 : -1
        });
        for (var d = e.length, f = 0; f < d; f++)
            b[f] = e[f].name;
        b = {
            resultsClass: "diigolet ac_results",
            data: b,
            mode: "multiple",
            multipleSeparator: " ,",
            id: "diigolet-ac"
        };
        try {
            new AutoComplete("#diigobm-tag-input",b)
        } catch (h) {
            debug(h)
        }
        $("#diigobm-tag-input").bind("input", function() {
            p()
        });
        $("#diigobm-list-addInput").on("focus", function() {
            $("#diigobm-list-add .diigo-alert-tip").hide()
        });
        $("#diigobm-list-addBtn").on("click", function() {
            if (!$(this).hasClass("processing")) {
                var g = $("#diigobm-list-addInput").val(), i = $("#diigobm-list-add .diigo-alert-tip"), k = [], l = popCtx.lists.length, t;
                for (t = 0; t < l; t++)
                    k.push(popCtx.lists[t].title);
                console.log(k, $.inArray(g, k));
                if (g.match(/^\s*$/))
                    i.show().find("span").text("Input a name");
                else if ($.inArray(g, k) !== -1)
                    i.show().find("span").text("Name existed !");
                else {
                    $(this).addClass("processing");
                    chrome.tabs.getSelected(null , function(Q) {
                        chrome.tabs.sendRequest(Q.id, {
                            name: "createList",
                            data: g
                        })
                    })
                }
            }
        });
        $("#diigobm-list-addCancel").on("click", function() {
            $("#diigobm-list-add .diigo-alert-tip").hide();
            $("#diigobm-list-add").hide();
            $("#diigobm-list").show();
            $("#diigobm-list-addInput").val("")
        });
        $("#w-upgrade").on("click", function(g) {
            g.preventDefault();
            chrome.tabs.create({
                url: "https://www.diigo.com/premium"
            });
            $("#diigobm-list-add-tip").hide();
            $("#diigobm-list").show()
        });
        $("#w-cancel").on("click", function(g) {
            g.preventDefault();
            $("#diigobm-list-add-tip").hide();
            $("#diigobm-list").show()
        });
        $("#diigobm-recent-tag,#diigobm-recommend-tag,#diigobm-group-tag").on("click", "div", function(g) {
            /diigo\-tag/.test(g.target.className) && v($(this).text())
        });
        $("#bottom").on("click", function(g) {
            switch (g.target.id) {
            case "diigobm-saveBtn":
                a ? P() : F();
                break;
            case "diigobm-cancelBtn":
                window.close();
                break
            }
        });
        $("#diigobm-tag-input").focus()
    }
    function n(a) {
        chrome.tabs.executeScript(a, {
            file: "js/checkTab.js"
        }, function() {
            debug("executeScript callback")
        })
    }
    popCtx = {
        groupTagsDict: {}
    };
    var m, u = false, y, j = chrome.extension.getBackgroundPage();
    chrome.tabs.getSelected(window.id, function(a) {
        chrome.browserAction.getBadgeText({
            tabId: a.id
        }, function(b) {
            if (b == "New") {
                chrome.browserAction.setBadgeText({
                    text: ""
                });
                chrome.tabs.create({
                    url: "http://www.appchangelog.com/log/20/Diigo-Web-Collector-Capture-and-Annotate/Meet-Diigo-Outliner-the-best-way-to-structurally-organize-your-information-and-thoughts"
                });
                localStorage.isClickedOnNew = "true";
                window.close()
            }
        })
    });
    chrome.storage.local.get("researchMode", function(a) {
        $("#research-mode-checkbox").prop("checked", a ? a.researchMode : false)
    });
    chrome.cookies.get({
        url: "https://www.diigo.com",
        name: "diigoandlogincookie"
    }, function(a) {
        if (a) {
            console.log(a);
            (m = a.value.split("-.-")[1]) && $("#sign-out-btn").text("Sign Out (" + m + ")");
            $("#action a").click(function(b) {
                b.preventDefault();
                var c;
                b = b.target.id;
                if (b != "more")
                    if (b === "tutorial")
                        chrome.tabs.query({
                            currentWindow: true,
                            active: true
                        }, function(e) {
                            chrome.tabs.sendRequest(e[0].id, {
                                name: "showTutorial"
                            });
                            window.close()
                        });
                    else {
                        switch (b) {
                        case "home":
                            c = "https://www.diigo.com/user/" + m;
                            break;
                        case "unread":
                            c = "https://www.diigo.com/user/" + m + "?type=bookmark&read=no";
                            break;
                        case "my-outliner":
                            c = "https://www.diigo.com/outliner";
                            break;
                        case "my-groups":
                            c = "https://groups.diigo.com/user/" + m;
                            break;
                        case "option":
                            c = chrome.extension.getURL("") + "options.html";
                            break;
                        case "changelog":
                            c = "http://www.appchangelog.com/extension/2/Diigo-Web-Collector-Capture-and-Annotate";
                            break;
                        case "sign-out-btn":
                            c = "https://www.diigo.com/sign-out";
                            break
                        }
                        chrome.tabs.getSelected(null , function(e) {
                            chrome.tabs.create({
                                url: c,
                                index: e.index + 1
                            })
                        })
                    }
            });
            $("#main").show();
            chrome.tabs.getSelected(null , function(b) {
                var c = b.url
                  , e = c.match(/https?:\/\/*\/*/gi);
                console.log(o(c));
                if (e == null || !o(c))
                    $("ul").addClass("disabled").find("li").off("click");
                else {
                    chrome.tabs.sendRequest(b.id, {
                        name: "ifbookmark"
                    });
                    console.log("ifbookmark")
                }
            })
        } else
            $("#sign-in").show()
    });
    chrome.extension.onRequest.addListener(function(a, b) {
        if (a.name == "isSaved") {
            var c = a.data;
            if (c.saved === true) {
                $("#bookmark-save").text("Edit").addClass("saved");
                $("#cached").show().bind("click", function() {
                    chrome.tabs.getSelected(null , function(e) {
                        var d = "https://www.diigo.com/cached?url=" + encodeURIComponent(e.url);
                        chrome.tabs.create({
                            url: d,
                            index: e.index + 1
                        })
                    })
                })
            }
            c.unread === true && $("#read-later").addClass("unread").text("Mark as Read")
        } else if (a.name == "sendCtx") {
            console.log("sendCtx", a.data);
            chrome.tabs.getSelected(null , function(e) {
                console.log(b.tab.id, e.id, b);
                if (b.tab.id == e.id) {
                    popCtx = $.extend(popCtx, a.data);
                    L(a.data)
                }
            })
        } else if (a.name == "sendRetags") {
            console.log(a.data);
            q("recommended", a.data)
        } else if (a.name == "sendGtags") {
            console.log(a.data);
            q("group", a.data)
        } else if (a.name == "popupclose")
            window.close();
        else if (a.name == "shownew")
            window.close();
        else if (a.name == "updateLists")
            r(a.data);
        else if (a.name == "updateGroups")
            w(a.data);
        else if (a.name == "updateGroupTag") {
            popCtx.groupTagsDict = a.data;
            c = $("#diigobm-group").find("select").val();
            console.log(c);
            q("group", popCtx.groupTagsDict[c])
        } else if (a.name == "listCreateSuccessAndUpdateLists") {
            r({
                list: a.lists,
                outliners: a.outliners
            });
            c = a.newlist;
            $("#diigobm-list").find("select").find("option[value=" + c + "]").attr("selected", true);
            $("#diigobm-list-addBtn").removeClass("processing");
            $("#diigobm-list-addInput").val("");
            $("#diigobm-list-add").hide();
            $("#diigobm-list").show()
        } else
            a.name == "listCreateFailureAndUpdateLists" && $("#diigobm-list-addBtn").removeClass("processing")
    });
    $("#sign-in-btn").click(function() {
        window.open("https://www.diigo.com/sign-in?referInfo=" + encodeURIComponent("/images/diigo-logo.png#SIGNED_IN"))
    });
    $("#sign-up-btn").click(function() {
        var a = "https://www.diigo.com/account/thirdparty/openid?openid_url=https://www.google.com/accounts/o8/id&redirect_url=" + encodeURIComponent("https://www.diigo.com/chrome_diigo_extension_done") + "&request_from=chrome_diigo_extension";
        window.open(a)
    });
    $("#bookmark").on("click", "div", function(a) {
        switch (a.target.id) {
        case "bookmark-save":
            chrome.tabs.getSelected(null , function(b) {
                n(b.id);
                $("#main").hide();
                $("#bm-main").show();
                chrome.tabs.sendRequest(b.id, {
                    name: "makeSnapshot"
                });
                s(false);
                H(popCtx)
            });
            break;
        case "bookmark-annotate":
            chrome.extension.sendRequest({
                name: "showToolbar"
            });
            window.close();
            break
        }
    });
    $("#bookmark-annotate").hover(function() {
        $(this).parent().addClass("annotate-hover")
    }, function() {
        $(this).parent().removeClass("annotate-hover")
    });
    $("#bookmark-save").hover(function() {
        $(this).parent().addClass("tag-hover")
    }, function() {
        $(this).parent().removeClass("tag-hover")
    });
    $("li").on("click", "b", function() {
        $(this).parent().trigger("click")
    });
    $("ul").on("click", "li", function(a) {
        a = a.target.id;
        var b = $(this).parent().hasClass("disabled");
        switch (a) {
        case "save-bookmark":
            if (b)
                return;
            chrome.tabs.getSelected(null , function(c) {
                n(c.id);
                $("#main").hide();
                $("#bm-main").show();
                chrome.tabs.getSelected(null , function(e) {
                    chrome.tabs.sendRequest(e.id, {
                        name: "makeSnapshot"
                    })
                });
                s();
                H(popCtx)
            });
            break;
        case "read-later":
            if (b)
                return;
            chrome.tabs.getSelected(null , function(c) {
                n(c.id);
                var e = $("#read-later").hasClass("unread") ? true : false;
                chrome.tabs.sendRequest(c.id, {
                    name: "readlater",
                    ifUnread: e
                });
                console.log("readlater")
            });
            break;
        case "screenshot":
            if (b)
                return;
            chrome.tabs.getSelected(null , function(c) {
                n(c.id);
                chrome.tabs.sendRequest(c.id, {
                    name: "screenshot"
                });
                window.close();
                console.log("send")
            });
            break;
        case "share":
            if (b)
                return;
            chrome.tabs.getSelected(null , function(c) {
                n(c.id);
                chrome.tabs.sendRequest(c.id, {
                    name: "share"
                });
                window.close()
            });
            break;
        case "research-mode":
            if (b)
                return;
            $("#main").hide();
            $("#bm-main").show();
            u = true;
            s(true);
            K(popCtx);
            break;
        case "search":
            $("#main").hide();
            $("#search-main").show();
            O();
            window.addEventListener("message", function(c) {
                console.log(c.data);
                var e = c.data.action;
                if (e == "openUrl") {
                    var d = c.data.url;
                    chrome.tabs.getSelected(null , function() {
                        c.data.ctrl ? chrome.tabs.create({
                            url: d,
                            active: false
                        }) : chrome.tabs.create({
                            url: d
                        })
                    })
                } else if (e == "searchTag") {
                    e = c.data.tag.indexOf(" ") != -1 ? '#"' + c.data.tag + '"' : "#" + c.data.tag;
                    $("#search-input").val(e);
                    $("#search-btn").trigger("click")
                }
            }, false);
            break
        }
    });
    $("#action #more").on("click", function() {
        $(this).toggleClass("unfold")
    });
    $("#tag-edit").on("click", function() {
        chrome.tabs.create({
            url: "https://www.diigo.com/cloud/" + m
        })
    });
    $("#remove").on("click", function() {
        chrome.tabs.getSelected(null , function(a) {
            chrome.tabs.sendRequest(a.id, {
                name: "qdeletebookmark"
            });
            window.close()
        })
    });
    $("#research-mode-checkbox").on("change", function() {
        if ($(this).prop("checked"))
            if (!j.GlobalData.permissions.autoShowAnnotation) {
                $(this).prop("checked", false);
                chrome.tabs.create({
                    url: "researchMode.html"
                });
                return
            }
        chrome.storage.local.set({
            researchMode: $(this).prop("checked")
        });
        $(this).prop("checked") && chrome.storage.local.get("researchModeData", function(a) {
            if (typeof a.researchModeData === "undefined") {
                $(this).prop("checked", false);
                $("#main").hide();
                $("#bm-main").show();
                u = true;
                s(true);
                K(popCtx)
            }
        })
    })
});
