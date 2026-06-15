/**
 * Extravaganza blog posts — seek embedded YouTube player from transcript timestamps.
 */
(function () {
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
})();
