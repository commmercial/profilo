<script>

    const intro = document.getElementById("intro");
    const typing = document.getElementById("typing");
    const card = document.getElementById("card");
    const video = document.getElementById("backgroundVideo");
    const cursor = document.getElementById("cursor");
    const cursorGlow = document.getElementById("cursorGlow");
    const profileName = document.getElementById("profileName");

    const audioTrack = new Audio("./audio.mp3");
    audioTrack.loop = true;

    const text = "click to enter";
    let index = 0;

    function typeText() {
      if (index >= text.length) return;
      typing.textContent = text.substring(0, index + 1);
      index++;
      const delay = 65 + Math.random() * 55;
      setTimeout(typeText, delay);
    }

    setTimeout(typeText, 350);

    let entered = false;

    function typeProfileName(name, callback) {
      let nIndex = 0;
      profileName.classList.add("typing-active");

      function step() {
        if (nIndex <= name.length) {
          profileName.textContent = name.substring(0, nIndex);
          nIndex++;
          setTimeout(step, 110 + Math.random() * 60);
        } else {
          profileName.classList.remove("typing-active");
          if (callback) callback();
        }
      }

      step();
    }

    function revealButtons() {
      const items = Array.from(document.querySelectorAll(".links .link, .volume-control"));
      items.forEach((item, i) => {
        setTimeout(() => {
          item.classList.add("item-visible");
        }, i * 140);
      });
    }

    async function enterSite() {
      if (entered) return;
      entered = true;

      try {
        video.muted = true;
        await video.play();

        audioTrack.volume = Number(volumeSlider.value);
        await audioTrack.play();
      } catch (error) {
        console.log("Playback error:", error);
      }

      intro.classList.add("hidden");

      setTimeout(() => {
        card.classList.add("visible");

        setTimeout(() => {
          typeProfileName("risk", () => {
            revealButtons();
          });
        }, 300);

      }, 150);
    }

    document.addEventListener("click", enterSite, { once: true });

    let mouseX = 0;
    let mouseY = 0;
    let glowX = 0;
    let glowY = 0;

    document.addEventListener("mousemove", event => {
      mouseX = event.clientX;
      mouseY = event.clientY;

      cursor.style.left = mouseX + "px";
      cursor.style.top = mouseY + "px";
    });

    function animateGlow() {
      glowX += (mouseX - glowX) * .18;
      glowY += (mouseY - glowY) * .18;

      cursorGlow.style.left = glowX + "px";
      cursorGlow.style.top = glowY + "px";

      requestAnimationFrame(animateGlow);
    }

    animateGlow();

    function setupCursorEvents() {
      const interactiveElements = document.querySelectorAll(
        ".link, .confirm-actions button, .avatar, .pfp-close-btn, .redirect-cancel-btn, .dc-modal-close, .dc-add-btn"
      );

      interactiveElements.forEach(elem => {
        elem.addEventListener("mouseenter", () => {
          cursor.style.width = "40px";
          cursor.style.height = "40px";
          cursor.style.filter = "drop-shadow(0 0 12px rgba(255,255,255,.55))";
        });

        elem.addEventListener("mouseleave", () => {
          cursor.style.width = "30px";
          cursor.style.height = "30px";
          cursor.style.filter = "drop-shadow(0 0 8px rgba(255,255,255,.3))";
        });
      });
    }

    setupCursorEvents();

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    document.addEventListener("mousemove", event => {
      const x = event.clientX / window.innerWidth - .5;
      const y = event.clientY / window.innerHeight - .5;

      targetX = x * 12;
      targetY = y * -12;
    });

    function animateCard() {
      currentX += (targetX - currentX) * .1;
      currentY += (targetY - currentY) * .1;

      if (entered) {
        card.style.transform =
          `translateX(0)
           perspective(1200px)
           rotateX(${currentY}deg)
           rotateY(${currentX}deg)
           translateZ(8px)`;
      }

      requestAnimationFrame(animateCard);
    }

    const volumeSlider = document.getElementById("volumeSlider");

    volumeSlider.addEventListener("input", () => {
      audioTrack.volume = Number(volumeSlider.value);
    });

    /* Confirmation & Redirect System */
    const confirmOverlay = document.getElementById("confirmOverlay");
    const confirmBox = document.getElementById("confirmBox");
    const redirectWrapper = document.getElementById("redirectWrapper");
    const redirectText = document.getElementById("redirectText");
    const redirectCancelBtn = document.getElementById("redirectCancelBtn");
    const cancelButton = document.getElementById("cancelButton");
    const continueButton = document.getElementById("continueButton");

    let pendingUrl = null;
    let hasConfirmedLeaving = false;
    let isRedirecting = false;
    let redirectTimer = null;

    function triggerRedirectPrompt(url) {
      pendingUrl = url;
      confirmBox.style.opacity = "1";
      confirmBox.style.pointerEvents = "auto";
      redirectWrapper.classList.remove("visible");
      confirmOverlay.classList.add("visible");
    }

    function startDirectRedirect(url) {
      pendingUrl = url;
      isRedirecting = true;
      confirmBox.style.opacity = "0";
      confirmBox.style.pointerEvents = "none";

      let count = 3;
      redirectText.textContent = `redirecting in ${count}...`;

      confirmOverlay.classList.add("visible");
      redirectWrapper.classList.add("visible");

      redirectTimer = setInterval(() => {
        count--;
        if (count > 0) {
          redirectText.textContent = `redirecting in ${count}...`;
        } else {
          clearInterval(redirectTimer);
          hasConfirmedLeaving = true;
          window.open(pendingUrl, "_blank", "noopener");

          setTimeout(() => {
            resetConfirmationState();
            hasConfirmedLeaving = false;
          }, 300);
        }
      }, 1000);
    }

    const externalLinks = document.querySelectorAll("a.link");
    externalLinks.forEach(link => {
      link.addEventListener("click", event => {
        if (hasConfirmedLeaving || isRedirecting) return;
        event.preventDefault();
        triggerRedirectPrompt(link.href);
      });
    });

    function resetConfirmationState() {
      if (redirectTimer) clearInterval(redirectTimer);
      isRedirecting = false;
      pendingUrl = null;
      redirectWrapper.classList.remove("visible");
      confirmOverlay.classList.remove("visible");

      setTimeout(() => {
        confirmBox.style.opacity = "1";
        confirmBox.style.pointerEvents = "auto";
      }, 200);
    }

    cancelButton.addEventListener("click", () => {
      if (isRedirecting) return;
      resetConfirmationState();
    });

    redirectCancelBtn.addEventListener("click", () => {
      resetConfirmationState();
    });

    continueButton.addEventListener("click", () => {
      if (!pendingUrl || isRedirecting) return;

      isRedirecting = true;
      confirmBox.style.opacity = "0";
      confirmBox.style.pointerEvents = "none";

      let count = 3;
      redirectText.textContent = `redirecting in ${count}...`;

      setTimeout(() => {
        redirectWrapper.classList.add("visible");
      }, 100);

      redirectTimer = setInterval(() => {
        count--;
        if (count > 0) {
          redirectText.textContent = `redirecting in ${count}...`;
        } else {
          clearInterval(redirectTimer);
          hasConfirmedLeaving = true;
          window.open(pendingUrl, "_blank", "noopener");

          setTimeout(() => {
            resetConfirmationState();
            hasConfirmedLeaving = false;
          }, 300);
        }
      }, 1000);
    });

    confirmOverlay.addEventListener("click", event => {
      if (event.target === confirmOverlay && !isRedirecting) {
        resetConfirmationState();
      }
    });

    /* Discord Lanyard & Modal Logic */
    const DISCORD_ID = "1547303503213367297";
    const discordLinkBtn = document.getElementById("discordLinkBtn");
    const dcModal = document.getElementById("dcModal");
    const dcModalClose = document.getElementById("dcModalClose");
    const dcAddBtn = document.getElementById("dcAddBtn");

    discordLinkBtn.addEventListener("click", () => {
      // Clear out outdated content immediately before the popup shows
      document.getElementById("dcModalActName").textContent = "loading activity...";
      document.getElementById("dcModalActDesc").style.display = "none";
      document.getElementById("dcModalActIcon").style.display = "none";

      fetchDiscordStatus();
      dcModal.classList.add("visible");
    });

    dcModalClose.addEventListener("click", () => {
      dcModal.classList.remove("visible");
    });

    dcModal.addEventListener("click", event => {
      if (event.target === dcModal) {
        dcModal.classList.remove("visible");
      }
    });

    dcAddBtn.addEventListener("click", () => {
      dcModal.classList.remove("visible");
      startDirectRedirect(discordLinkBtn.getAttribute("data-href"));
    });

    async function fetchDiscordStatus() {
      try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`);
        const result = await response.json();

        if (!result.success) return;

        const data = result.data;
        const dcModalAvatar = document.getElementById("dcModalAvatar");
        const dcModalStatusDot = document.getElementById("dcModalStatusDot");
        const dcModalUsername = document.getElementById("dcModalUsername");
        const dcModalStatusText = document.getElementById("dcModalStatusText");
        const dcModalActIcon = document.getElementById("dcModalActIcon");
        const dcModalActName = document.getElementById("dcModalActName");
        const dcModalActDesc = document.getElementById("dcModalActDesc");

        dcModalUsername.textContent = `@${data.discord_user.username}`;

        if (data.discord_user.avatar) {
          dcModalAvatar.src = `https://cdn.discordapp.com/avatars/${DISCORD_ID}/${data.discord_user.avatar}.png?size=128`;
        }

        const status = data.discord_status || "offline";
        dcModalStatusDot.className = `dc-status-indicator ${status}`;
        dcModalStatusText.textContent = status === "dnd" ? "Do Not Disturb" : status;

        if (data.listening_to_spotify) {
          dcModalActIcon.style.display = "block";
          dcModalActIcon.src = data.spotify.album_art_url;
          dcModalActName.textContent = `Listening to ${data.spotify.song}`;
          dcModalActDesc.style.display = "block";
          dcModalActDesc.textContent = `by ${data.spotify.artist}`;
        } 
        else if (data.activities && data.activities.length > 0) {
          const act = data.activities.find(a => a.type !== 4) || data.activities[0];

          if (act && act.name && act.type !== 4) {
            
            let activityPrefix = "Playing";
            if (act.type === 1) activityPrefix = "Streaming";
            else if (act.type === 2) activityPrefix = "Listening to";
            else if (act.type === 3) activityPrefix = "Watching";
            else if (act.type === 5) activityPrefix = "Competing in";

            let formattedName = act.name;
            if (formattedName.toLowerCase() === "roiblox" || formattedName.toLowerCase() === "roblox") {
              formattedName = "Roblox";
            }

            dcModalActName.textContent = `${activityPrefix} ${formattedName}`;

            if (act.details || act.state) {
              dcModalActDesc.style.display = "block";
              dcModalActDesc.textContent = act.details || act.state;
            } else {
              dcModalActDesc.style.display = "none";
            }

            if (act.assets && act.assets.large_image) {
              dcModalActIcon.style.display = "block";
              if (act.assets.large_image.startsWith("spotify:")) {
                const spotifyId = act.assets.large_image.replace("spotify:", "");
                dcModalActIcon.src = `https://i.scdn.co/image/${spotifyId}`;
              } else {
                dcModalActIcon.src = `https://cdn.discordapp.com/app-assets/${act.application_id}/${act.assets.large_image}.png`;
              }
            } else {
              dcModalActIcon.style.display = "none";
            }
          } else {
            dcModalActIcon.style.display = "none";
            dcModalActName.textContent = "doing nothing right now...";
            dcModalActDesc.style.display = "none";
          }
        } else {
          dcModalActIcon.style.display = "none";
          dcModalActName.textContent = "doing nothing right now...";
          dcModalActDesc.style.display = "none";
        }

      } catch (err) {
        console.log("Discord Lanyard fetch error:", err);
      }
    }

    /* PFP Viewer Logic */
    const avatarBtn = document.getElementById("avatarBtn");
    const pfpModal = document.getElementById("pfpModal");
    const pfpCloseBtn = document.getElementById("pfpCloseBtn");

    avatarBtn.addEventListener("click", () => {
      pfpModal.classList.add("visible");
    });

    pfpCloseBtn.addEventListener("click", () => {
      pfpModal.classList.remove("visible");
    });

    pfpModal.addEventListener("click", event => {
      if (event.target === pfpModal) {
        pfpModal.classList.remove("visible");
      }
    });

    animateCard();

    document.addEventListener("mouseleave", () => {
      targetX = 0;
      targetY = 0;
    });

  </script>