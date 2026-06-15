/**
 * Extravaganza blog posts — visitor counter, creed rotation, share, YouTube seek.
 */
(function () {
  var HIT_GUARD_MS = 24 * 60 * 60 * 1000;

  initCounter();
  initCreed();
  initShare();
  initYouTubeSeek();

  function initCounter() {
    var el = document.querySelector(".extravaganza-counter[data-hit-key]");
    if (!el) return;

    var hitKey = el.getAttribute("data-hit-key");
    if (!hitKey) return;

    var storageKey = "extravaganza-hit:" + hitKey;
    var lastHit = parseInt(localStorage.getItem(storageKey), 10);
    var shouldPost =
      !lastHit || Number.isNaN(lastHit) || Date.now() - lastHit >= HIT_GUARD_MS;

    var url = "/api/hits?key=" + encodeURIComponent(hitKey);
    var fetchOpts = shouldPost ? {method: "POST"} : {method: "GET"};

    fetch(url, fetchOpts)
      .then(function (response) {
        if (!response.ok) throw new Error("hits request failed");
        return response.json();
      })
      .then(function (data) {
        if (shouldPost) {
          localStorage.setItem(storageKey, String(Date.now()));
        }
        renderCounter(el, data.count);
      })
      .catch(function () {
        /* decorative — fail silently */
      });
  }

  function renderCounter(el, count) {
    var n = typeof count === "number" && !Number.isNaN(count) ? count : 0;
    var padded = String(n);
    while (padded.length < 6) {
      padded = "0" + padded;
    }
    el.textContent = "you are visitor #" + padded + " to this episode";
    el.hidden = false;
  }

  function initCreed() {
    var blob = document.getElementById("extravaganza-creed");
    if (!blob) return;

    var data;
    try {
      data = JSON.parse(blob.textContent);
    } catch (e) {
      return;
    }

    if (
      !data ||
      typeof data.basePath !== "string" ||
      !Array.isArray(data.creeds) ||
      data.creeds.length === 0
    ) {
      return;
    }

    var pick = data.creeds[Math.floor(Math.random() * data.creeds.length)];
    if (!pick || typeof pick.key !== "string" || typeof pick.text !== "string") {
      return;
    }

    document.querySelectorAll("[data-creed]").forEach(function (node) {
      node.textContent = pick.text;
    });

    var href = "https://getmeos.com/" + data.basePath + "-" + pick.key;
    document.querySelectorAll("a.extravaganza-cta__link").forEach(function (link) {
      link.href = href;
    });
  }

  function initShare() {
    var pageUrl = window.location.href;
    var pageTitle = document.title;
    var nativeBtn = document.querySelector('[data-share="native"]');
    var copyBtn = document.querySelector('[data-share="copy"]');

    if (nativeBtn) {
      if (!navigator.share) {
        nativeBtn.hidden = true;
      } else {
        nativeBtn.addEventListener("click", function () {
          navigator.share({title: pageTitle, url: pageUrl}).catch(function () {
            /* user cancelled or share failed */
          });
        });
      }
    }

    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        var original = copyBtn.textContent;
        var onCopied = function () {
          copyBtn.textContent = "Copied!";
          window.setTimeout(function () {
            copyBtn.textContent = original;
          }, 2000);
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(pageUrl).then(onCopied).catch(function () {});
        }
      });
    }
  }

  function initYouTubeSeek() {
    var iframe = document.getElementById("extravaganza-yt");
    if (!iframe) return;

    var player = null;
    var seekLinksBound = false;

    function scrollToPlayer() {
      var anchor = document.getElementById("extravaganza-yt-anchor");
      if (anchor) {
        anchor.scrollIntoView({behavior: "smooth", block: "center"});
      }
    }

    function seekTo(seconds) {
      if (player && typeof player.seekTo === "function") {
        player.seekTo(seconds, true);
        if (typeof player.playVideo === "function") {
          player.playVideo();
        }
        scrollToPlayer();
        return true;
      }
      return false;
    }

    function bindSeekLinks() {
      if (seekLinksBound) return;
      seekLinksBound = true;

      document.querySelectorAll("[data-seek-seconds]").forEach(function (el) {
        el.addEventListener("click", function (event) {
          event.preventDefault();
          var raw = el.getAttribute("data-seek-seconds");
          var seconds = parseInt(raw, 10);
          if (Number.isNaN(seconds)) return;
          seekTo(seconds);
        });
      });
    }

    function initPlayer() {
      player = new YT.Player("extravaganza-yt", {
        events: {
          onReady: function () {
            bindSeekLinks();
          },
        },
      });
    }

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
      var tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      var firstScript = document.getElementsByTagName("script")[0];
      firstScript.parentNode.insertBefore(tag, firstScript);
    }
  }
})();
