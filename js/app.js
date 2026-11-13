(function () {
  "use strict";

  var STORAGE_KEY = "grievance-angle";
  var indexCache = null;

  function getStoredAngle() {
    try {
      return localStorage.getItem(STORAGE_KEY) === "female" ? "female" : "male";
    } catch (err) {
      return "male";
    }
  }

  function storeAngle(angle) {
    try {
      localStorage.setItem(STORAGE_KEY, angle);
    } catch (err) {
      /* private mode, ignore */
    }
  }

  function currentAngle() {
    return document.documentElement.dataset.angle === "female" ? "female" : "male";
  }

  function setAngle(angle) {
    var next = angle === "female" ? "female" : "male";
    document.documentElement.dataset.angle = next;
    storeAngle(next);
    document.querySelectorAll(".angle-toggle button").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(btn.dataset.angle === next));
    });
    var label = document.getElementById("angle-live");
    if (label) {
      label.textContent =
        next === "male" ? "Showing the male angle" : "Showing the female angle";
    }
  }

  function formatLongDate(iso) {
    var parts = iso.split("-").map(Number);
    var date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC"
    }).format(date);
  }

  function formatShortDate(iso) {
    var parts = iso.split("-").map(Number);
    var date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC"
    }).format(date);
  }

  function requestedDate() {
    return new URLSearchParams(window.location.search).get("date");
  }

  function issueNumber(index, date) {
    var oldestFirst = index.slice().sort(function (a, b) {
      return a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
    });
    var i = oldestFirst.findIndex(function (item) {
      return item.date === date;
    });
    return i === -1 ? 1 : i + 1;
  }

  function fetchJson(path) {
    return fetch(path, { cache: "no-cache" }).then(function (res) {
      if (!res.ok) {
        throw new Error("Could not load " + path + " (" + res.status + ")");
      }
      return res.json();
    });
  }

  function loadIndex() {
    if (indexCache) return Promise.resolve(indexCache);
    return fetchJson("./stories/index.json").then(function (data) {
      indexCache = data;
      return data;
    });
  }

  function renderStory(story, index) {
    var angle = currentAngle();
    var copy = story[angle];
    var headline = document.getElementById("headline");
    var standfirst = document.getElementById("standfirst");
    var body = document.getElementById("story-body");
    var summary = document.getElementById("stat-summary");
    var source = document.getElementById("stat-source");
    var dateline = document.getElementById("dateline");
    var issue = document.getElementById("issue");
    var back = document.getElementById("back-latest");

    document.title = copy.headline + " — The Daily Grievance";
    headline.textContent = copy.headline;
    standfirst.textContent = copy.standfirst;
    dateline.textContent = formatLongDate(story.date);

    var figure = document.getElementById("lead-photo");
    var img = document.getElementById("lead-image");
    var caption = document.getElementById("lead-caption");
    if (figure && img && caption) {
      if (copy.image) {
        var src = copy.image;
        if (img.getAttribute("src") !== src) {
          img.src = src;
        }
        img.alt = copy.image_caption || copy.headline || "";
        caption.textContent = copy.image_caption || "";
        figure.classList.remove("hidden");
      } else {
        img.removeAttribute("src");
        img.alt = "";
        caption.textContent = "";
        figure.classList.add("hidden");
      }
    }

    if (issue) {
      issue.textContent = "Vol. I, No. " + issueNumber(index, story.date);
    }

    body.innerHTML = "";
    copy.body_paragraphs.forEach(function (text, i) {
      var p = document.createElement("p");
      p.textContent = text;
      body.appendChild(p);
      if (i === 1 && copy.pull_quote) {
        var quote = document.createElement("blockquote");
        quote.className = "pull-quote";
        quote.textContent = copy.pull_quote;
        body.appendChild(quote);
      }
    });

    summary.textContent = story.stat_summary;
    source.innerHTML = "";
    var srcLabel = document.createElement("span");
    srcLabel.className = "label";
    srcLabel.textContent = "Source";
    var srcLink = document.createElement("a");
    srcLink.href = story.stat_source_url;
    srcLink.rel = "noopener noreferrer";
    srcLink.target = "_blank";
    srcLink.textContent = story.stat_source_title;
    source.appendChild(srcLabel);
    source.appendChild(srcLink);

    if (back) {
      var latest = index[0];
      if (latest && latest.date !== story.date) {
        back.classList.remove("hidden");
        back.querySelector("a").href = "./";
      } else {
        back.classList.add("hidden");
      }
    }

    var article = document.getElementById("hot-crisis");
    if (article) article.classList.remove("hidden");
    var loading = document.getElementById("loading");
    if (loading) loading.classList.add("hidden");
    var error = document.getElementById("error");
    if (error) error.classList.add("hidden");
  }

  function renderArchive(index, currentDate) {
    var list = document.getElementById("archive-list");
    if (!list) return;

    list.innerHTML = "";
    if (!index.length) {
      var empty = document.createElement("li");
      empty.className = "empty";
      empty.textContent = "No editions on file yet.";
      list.appendChild(empty);
      return;
    }

    index.forEach(function (item) {
      var li = document.createElement("li");
      var link = document.createElement("a");
      link.href = "./?date=" + encodeURIComponent(item.date);
      if (item.date === currentDate) {
        link.setAttribute("aria-current", "page");
      }

      var dateEl = document.createElement("div");
      dateEl.className = "archive-date";
      dateEl.textContent = formatShortDate(item.date);

      var heads = document.createElement("div");
      heads.className = "archive-headlines";

      var male = document.createElement("div");
      var maleTag = document.createElement("span");
      maleTag.className = "which male";
      maleTag.textContent = "Male";
      var maleHead = document.createElement("strong");
      maleHead.textContent = item.male_headline;
      male.appendChild(maleTag);
      male.appendChild(maleHead);

      var female = document.createElement("div");
      var femaleTag = document.createElement("span");
      femaleTag.className = "which female";
      femaleTag.textContent = "Female";
      var femaleHead = document.createElement("strong");
      femaleHead.textContent = item.female_headline;
      female.appendChild(femaleTag);
      female.appendChild(femaleHead);

      heads.appendChild(male);
      heads.appendChild(female);
      link.appendChild(dateEl);
      link.appendChild(heads);
      li.appendChild(link);
      list.appendChild(li);
    });
  }

  function showError(message) {
    var loading = document.getElementById("loading");
    var error = document.getElementById("error");
    var article = document.getElementById("hot-crisis");
    if (loading) loading.classList.add("hidden");
    if (article) article.classList.add("hidden");
    if (error) {
      error.textContent = message;
      error.classList.remove("hidden");
    }
  }

  function bindToggle() {
    document.querySelectorAll(".angle-toggle button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setAngle(btn.dataset.angle);
        if (window.__grievanceStory && window.__grievanceIndex) {
          renderStory(window.__grievanceStory, window.__grievanceIndex);
        }
      });
    });
  }

  function initHome() {
    setAngle(getStoredAngle());
    bindToggle();

    loadIndex()
      .then(function (index) {
        if (!index.length) {
          throw new Error("The archive is empty.");
        }
        var wanted = requestedDate();
        var match = wanted && index.some(function (item) {
          return item.date === wanted;
        });
        var date = match ? wanted : index[0].date;
        renderArchive(index, date);
        return fetchJson("./stories/" + date + ".json").then(function (story) {
          window.__grievanceStory = story;
          window.__grievanceIndex = index;
          renderStory(story, index);
        });
      })
      .catch(function (err) {
        console.error(err);
        showError(
          "We couldn’t set the type on today’s edition. Check you are viewing the site over http (not as a file), and that the story files are in place."
        );
        loadIndex()
          .then(function (index) {
            renderArchive(index, null);
          })
          .catch(function () {});
      });
  }

  function initArchive() {
    setAngle(getStoredAngle());
    bindToggle();
    var dateline = document.getElementById("dateline");
    if (dateline) {
      dateline.textContent = new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      }).format(new Date());
    }
    loadIndex()
      .then(function (index) {
        renderArchive(index, requestedDate());
        var loading = document.getElementById("loading");
        if (loading) loading.classList.add("hidden");
      })
      .catch(function (err) {
        console.error(err);
        showError("The archive could not be loaded. Try again from the home page.");
      });
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (document.body.dataset.page === "archive") {
      initArchive();
    } else {
      initHome();
    }
  });
})();
