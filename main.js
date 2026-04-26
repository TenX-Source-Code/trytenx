/*
 * count-up convention:
 *   <span class="count-up" data-target="60" data-prefix="<" data-suffix="s"
 *         data-direction="down" data-duration="800">...</span>
 *   direction "up"   (default): animates 0 → target
 *   direction "down":           animates target → 1 then snaps to prefix+target+suffix
 *   During animation (up):    `${current}${suffix}`
 *   During animation (down):  `${current}${suffix}`
 *   Final settled frame:      `${prefix}${target}${suffix}`
 *   Under prefers-reduced-motion, final value is written immediately.
 */
(function () {
  'use strict';
  var doc = document;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reveal observer
  var reveals = doc.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var revealObs = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    reveals.forEach(function (el) { revealObs.observe(el); });
  }

  // Count-up helper (supports direction up/down)
  var counters = doc.querySelectorAll('.count-up[data-target]');
  function runCount(el) {
    var target = parseFloat(el.getAttribute('data-target'));
    if (!isFinite(target)) return;
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    var direction = el.getAttribute('data-direction') || 'up';
    var duration = parseInt(el.getAttribute('data-duration'), 10) || 800;
    if (reduced) { el.textContent = prefix + target + suffix; return; }
    var start = performance.now();
    function frame(now) {
      var t = Math.min(1, (now - start) / duration);
      var eased = 1 - Math.pow(1 - t, 3);
      var current;
      if (direction === 'down') {
        current = Math.max(1, Math.round(target - (target - 1) * eased));
      } else {
        current = Math.round(target * eased);
      }
      if (t < 1) {
        // Preserve prefix during animation so "<60s" doesn't briefly read "60s"
        el.textContent = prefix + current + suffix;
        requestAnimationFrame(frame);
      } else {
        el.textContent = prefix + target + suffix;
      }
    }
    requestAnimationFrame(frame);
  }
  if (counters.length) {
    if (reduced || !('IntersectionObserver' in window)) {
      counters.forEach(runCount);
    } else {
      var countObs = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            runCount(entry.target);
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      counters.forEach(function (el) { countObs.observe(el); });
    }
  }

  // Smooth scroll for all anchor links pointing to page sections
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').slice(1);
      if (!id) return;
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Email form submission
  (function () {
    var form = document.getElementById('cf-form');
    var input = document.getElementById('cf-email-input');
    var btn = document.getElementById('cf-submit');
    var errEl = document.getElementById('cf-error');
    var successEl = document.getElementById('cf-success');
    if (!form) return;

    var SUBMIT_URL = 'https://formspree.io/f/myklkabe';

    function setError(msg) {
      errEl.textContent = msg;
      errEl.style.display = msg ? 'block' : 'none';
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      setError('');

      var email = input.value.trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('Please enter a valid email address.');
        input.focus();
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Sending…';

      fetch(SUBMIT_URL, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email }),
      })
        .then(function (res) {
          if (res.ok) {
            form.style.display = 'none';
            successEl.style.display = 'block';
          } else {
            return res.json().then(function (data) {
              throw new Error((data && data.error) || 'Submission failed. Please try again.');
            });
          }
        })
        .catch(function (err) {
          setError(err.message || 'Something went wrong. Please try again.');
          btn.disabled = false;
          btn.textContent = 'Request Access';
        });
    });
  })();

  // Hero scanline — fire once, clean up on animationend
  function triggerScanline() {
    if (reduced) return;
    var sl = doc.getElementById('hero-scanline');
    if (!sl || sl.dataset.played) return;
    sl.dataset.played = '1';
    sl.addEventListener('animationend', function () { sl.classList.remove('play'); }, { once: true });
    setTimeout(function () { sl.classList.add('play'); }, 200);
  }
  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', triggerScanline);
  } else {
    triggerScanline();
  }
})();


      (function () {
        var shell = document.getElementById('nav-shell');
        if (!shell) return;
        var scrolled = false;
        function onScroll() {
          var s = window.scrollY > 80;
          if (s !== scrolled) { scrolled = s; shell.classList.toggle('scrolled', s); }
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
      })();


        /* Stacked deck cycle: each click rotates all cards forward one slot.
           Top → back-2, back → top, back-2 → back. No tuck animation —
           everyone transitions to their new resting position in place. */
        (function () {
          var grid = document.getElementById('sr-cards-grid');
          var score = document.getElementById('sr-slot-score');
          var sum = document.getElementById('sr-slot-summary');
          var pill = document.getElementById('sr-slot-pillars');
          if (!grid || !score || !sum || !pill) return;
          var animating = false;

          var STATES = ['is-top', 'is-back', 'is-back-2'];
          function stateOf(el) {
            for (var i = 0; i < STATES.length; i++) if (el.classList.contains(STATES[i])) return i;
            return -1;
          }

          function cycle() {
            if (animating) return;
            animating = true;
            var slots = [score, sum, pill];
            // Map current state → next state: 0→2, 1→0, 2→1
            // (top goes to back-most, everyone else moves forward)
            slots.forEach(function (el) {
              var s = stateOf(el);
              var next = s === 0 ? 2 : s === 1 ? 0 : 1;
              STATES.forEach(function (cls) { el.classList.remove(cls); });
              el.classList.add(STATES[next]);
            });
            // Match the CSS transition length (600ms) before unlocking
            setTimeout(function () { animating = false; }, 640);
          }

          /* ── Swipe / drag: pointer gesture on the top card. Drag past
             60px in any vertical direction triggers cycle; tap also works;
             interactive children (pillar rows, links) pass through. ── */
          var SWIPE_THRESHOLD = 60;
          var dragState = null;

          function getTop() { return grid.querySelector('.slot.is-top'); }

          function onPointerDown(e) {
            var top = getTop();
            if (!top) return;
            if (!top.contains(e.target)) return;
            // Only block interactive children INSIDE the slot — not the slot itself
            // (the slot has tabindex="0" which would match the old selector).
            var interactive = e.target.closest('a, button, input, .sc-pillar');
            if (interactive && top.contains(interactive)) return;
            if (animating) return;
            dragState = {
              el: top,
              startY: e.clientY,
              startX: e.clientX,
              moved: false,
            };
            top.style.transition = 'none';
            if (top.setPointerCapture) top.setPointerCapture(e.pointerId);
          }
          function onPointerMove(e) {
            if (!dragState) return;
            var dy = e.clientY - dragState.startY;
            var dx = e.clientX - dragState.startX;
            if (Math.abs(dy) > 4 || Math.abs(dx) > 4) dragState.moved = true;
            // Follow finger, small sideways drift for feel
            dragState.el.style.transform =
              'translate(' + (dx * 0.15) + 'px, ' + dy + 'px) scale(1)';
            dragState.el.style.opacity = String(Math.max(0.35, 1 - Math.abs(dy) / 300));
          }
          function onPointerUp(e) {
            if (!dragState) return;
            var el = dragState.el;
            var dy = e.clientY - dragState.startY;
            var moved = dragState.moved;
            dragState = null;
            el.style.transition = '';
            el.style.transform = '';
            el.style.opacity = '';

            if (Math.abs(dy) > SWIPE_THRESHOLD) {
              cycle();            // enough swipe — cycle
            }
            // else: short drag — snaps back (transforms reset above)
          }

          [score, sum, pill].forEach(function (el) {
            el.addEventListener('pointerdown', onPointerDown);
            el.addEventListener('keydown', function (e) {
              if ((e.key === 'Enter' || e.key === ' ') && el.classList.contains('is-top')) {
                e.preventDefault();
                cycle();
              }
            });
          });

          window.addEventListener('pointermove', onPointerMove);
          window.addEventListener('pointerup', onPointerUp);
          window.addEventListener('pointercancel', onPointerUp);

          ['sr-next-score', 'sr-next-sum', 'sr-next-pill'].forEach(function (id) {
            var btn = document.getElementById(id);
            if (!btn) return;
            btn.addEventListener('click', function (e) {
              e.stopPropagation();
              cycle();
            });
            btn.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
          });
        })();


        (function () {
          var card = document.getElementById('hero-score-card');
          if (!card) return;
          var scoreNum = card.querySelector('[data-score-num]');
          var scoreDen = card.querySelector('[data-score-den]');
          var caption = card.querySelector('[data-caption]');
          var pillars = card.querySelectorAll('[data-pillars] .sc-pillar');
          var fills = card.querySelectorAll('.bar-fill');
          var pad = function (n) { return (n < 10 ? '0' : '') + n; };
          var defaults = { num: 21, den: 25, cap: caption ? caption.textContent : '' };
          var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

          // Tween scoreNum from current to target over ~200ms
          var tweenRaf = 0;
          function tweenNum(to) {
            if (reduced) { scoreNum.textContent = pad(to); return; }
            cancelAnimationFrame(tweenRaf);
            var from = parseInt(scoreNum.textContent, 10);
            if (!isFinite(from)) from = to;
            var start = performance.now(), dur = 200;
            (function tick(now) {
              var p = Math.min(1, (now - start) / dur);
              var eased = 1 - Math.pow(1 - p, 3);
              scoreNum.textContent = pad(Math.round(from + (to - from) * eased));
              if (p < 1) tweenRaf = requestAnimationFrame(tick);
            })(start);
          }

          function play() {
            fills.forEach(function (f) {
              var t = f.getAttribute('data-target') || '0';
              requestAnimationFrame(function () { f.style.width = t + '%'; });
            });
            if (reduced) { scoreNum.textContent = pad(defaults.num); return; }
            var start = performance.now(), dur = 800;
            (function tick(now) {
              var p = Math.min(1, (now - start) / dur);
              var eased = 1 - Math.pow(1 - p, 3);
              scoreNum.textContent = pad(Math.round(eased * defaults.num));
              if (p < 1) requestAnimationFrame(tick);
            })(start);
          }

          function focusPillar(row) {
            card.classList.add('is-pillar');
            tweenNum(+row.dataset.val);
            scoreDen.textContent = pad(+row.dataset.max);
            caption.textContent = row.dataset.desc;
          }
          function blurPillar() {
            card.classList.remove('is-pillar');
            tweenNum(defaults.num);
            scoreDen.textContent = pad(defaults.den);
            caption.textContent = defaults.cap;
          }

          var isTouch = window.matchMedia('(hover: none)').matches;
          pillars.forEach(function (row) {
            if (!isTouch) {
              row.addEventListener('mouseenter', function () { focusPillar(row); });
              row.addEventListener('mouseleave', blurPillar);
            }
            // Keyboard: Tab focuses, Enter/Space toggles-on, blur restores
            row.addEventListener('focus', function () { focusPillar(row); });
            row.addEventListener('blur', blurPillar);
            row.addEventListener('keydown', function (e) {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); focusPillar(row); }
              if (e.key === 'Escape') { row.blur(); }
            });
          });


          // Click pillar to expand description
          pillars.forEach(function (row) {
            row.addEventListener('click', function () {
              var wasOpen = row.classList.contains('is-expanded');
              pillars.forEach(function (r) { r.classList.remove('is-expanded'); });
              if (!wasOpen) row.classList.add('is-expanded');
            });
          });

          function boot() { play(); }
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', boot);
          } else { boot(); }
        })();


        (function () {
          var form = document.getElementById('rw-term-form');
          var input = document.getElementById('rw-term-input');
          var body = document.getElementById('rw-term-body');
          var term = document.getElementById('rw-term');
          var handle = document.getElementById('rw-term-resize');
          if (!form) return;

          /* ── Resize: drag splits the editor/terminal share inside a fixed
             IDE height. Drag up = bigger terminal (smaller editor). ── */
          var grid = term.parentElement;            // .ide-grid
          var EDITOR_MIN = 80;                        // keep editor visible
          var TERM_MIN = 80;                        // keep at least the input strip
          var dragging = false, startY = 0, startH = 0;

          function clamp(h) {
            var total = grid.getBoundingClientRect().height;
            var max = total - EDITOR_MIN;
            return Math.max(TERM_MIN, Math.min(max, h));
          }
          function setTermH(h) {
            grid.style.setProperty('--term-h', clamp(h) + 'px');
          }
          function onDown(e) {
            dragging = true;
            startY = (e.touches ? e.touches[0].clientY : e.clientY);
            startH = term.getBoundingClientRect().height;
            term.classList.add('is-resizing');
            e.preventDefault();
          }
          function onMove(e) {
            if (!dragging) return;
            var y = (e.touches ? e.touches[0].clientY : e.clientY);
            setTermH(startH - (y - startY));
          }
          function onUp() {
            if (!dragging) return;
            dragging = false;
            term.classList.remove('is-resizing');
          }
          handle.addEventListener('mousedown', onDown);
          handle.addEventListener('touchstart', onDown, { passive: false });
          window.addEventListener('mousemove', onMove);
          window.addEventListener('touchmove', onMove, { passive: false });
          window.addEventListener('mouseup', onUp);
          window.addEventListener('touchend', onUp);
          // Keyboard a11y: arrow keys nudge by 16px
          handle.addEventListener('keydown', function (e) {
            var h = term.getBoundingClientRect().height;
            if (e.key === 'ArrowUp') { setTermH(h + 16); e.preventDefault(); }
            if (e.key === 'ArrowDown') { setTermH(h - 16); e.preventDefault(); }
          });

          var promptLine = form;  // .term-prompt-line === form
          var mirror = document.getElementById('rw-term-mirror');
          // Click anywhere on the prompt line to focus the input
          promptLine.addEventListener('click', function () { input.focus(); });
          // Focus / blur / typing toggles the at-rest cursor block
          input.addEventListener('focus', function () { promptLine.classList.add('is-active'); });
          input.addEventListener('blur', function () { promptLine.classList.remove('is-active'); });
          input.addEventListener('input', function () {
            promptLine.classList.toggle('has-text', input.value.length > 0);
            // Mirror reflects current value so the field shrinks/grows with text.
            // When empty, fall back to placeholder so cursor sits after "try typing something…".
            mirror.textContent = input.value || input.placeholder;
          });

          form.addEventListener('submit', function (e) {
            e.preventDefault();
            var text = (input.value || '').trim();
            if (!text) return;

            // Freeze the current prompt as an echo line (inserted BEFORE the
            // live prompt so the live one stays at the bottom).
            var echo = document.createElement('div');
            echo.className = 'term-echo';
            echo.innerHTML = '<span class="ps">tenx ›</span>';
            echo.appendChild(document.createTextNode(text));
            body.insertBefore(echo, promptLine);

            // Append a "thinking" line with spinner.
            var think = document.createElement('div');
            think.className = 'term-line';
            think.innerHTML =
              '<span class="term-thinking">' +
              '<span class="spinner" aria-hidden="true"></span>' +
              '<span>thinking…</span>' +
              '</span>';
            body.insertBefore(think, promptLine);

            input.value = '';
            input.disabled = true;

            // Pin scroll to bottom so the live prompt stays in view
            body.scrollTop = body.scrollHeight;

            // Re-enable so visitors can try multiple prompts
            setTimeout(function () {
              input.disabled = false;
              input.focus();
              body.scrollTop = body.scrollHeight;
            }, 1600);
          });
        })();

        // ── Device assembly spring animation ──
        (function () {
          var scene = document.querySelector('#real-work .device-scene');
          var shell = document.querySelector('#real-work .device-shell');
          var layerBack = document.querySelector('#real-work .layer-back');
          var layerKbd = document.querySelector('#real-work .layer-keyboard');
          var layerBezel = document.querySelector('#real-work .layer-bezel');
          var layerScr = document.querySelector('#real-work .layer-screen');
          if (!shell) return;

          var state = {
            lidZ: { x: 700, v: 0, t: 0 },
            baseZ: { x: -600, v: 0, t: 0 },
            bezelZ: { x: 400, v: 0, t: 0 },
            screenZ: { x: 200, v: 0, t: 0 },
            rotX: { x: -20, v: 0, t: 0 },
            rotY: { x: 18, v: 0, t: 0 },
          };

          var CFG = { stiffness: 0.045, damping: 0.82, mass: 2.0 };

          function stepSpring(s) {
            var force = (s.t - s.x) * CFG.stiffness;
            s.v = s.v * CFG.damping + force / CFG.mass;
            s.x += s.v;
          }

          function settled() {
            return Object.keys(state).every(function (k) {
              var s = state[k];
              return Math.abs(s.t - s.x) < 0.15 && Math.abs(s.v) < 0.05;
            });
          }

          var screenAwoken = false;

          function tick() {
            Object.keys(state).forEach(function (k) { stepSpring(state[k]); });

            shell.style.transform =
              'rotateX(' + state.rotX.x.toFixed(3) + 'deg) rotateY(' + state.rotY.x.toFixed(3) + 'deg)';
            layerBack.style.transform = 'translateZ(' + (state.lidZ.x - 8).toFixed(2) + 'px)';
            layerKbd.style.transform = 'translateZ(' + state.baseZ.x.toFixed(2) + 'px) rotateX(78deg)';
            layerBezel.style.transform = 'translateZ(' + state.bezelZ.x.toFixed(2) + 'px)';
            layerScr.style.transform = 'translateZ(' + state.screenZ.x.toFixed(2) + 'px)';

            if (!settled()) {
              requestAnimationFrame(tick);
            } else {
              if (!screenAwoken) {
                screenAwoken = true;
                // Shimmer sweeps first — IDE fades in 200ms later so the swipe leads the reveal
                setTimeout(function () {
                  layerScr.classList.add('shimmer');
                  setTimeout(function () { layerScr.classList.add('screen-awake'); }, 200);
                }, 120);
              }
              shell.style.transform = 'rotateX(0deg) rotateY(0deg)';
              layerBack.style.transform = 'translateZ(-8px)';
              layerKbd.style.transform = 'translateZ(0px) rotateX(78deg)';
              layerBezel.style.transform = 'translateZ(0px)';
              layerScr.style.transform = 'translateZ(0px)';
            }
          }

          if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            layerScr.classList.add('screen-awake');
            return;
          }

          var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
              if (e.isIntersecting) {
                io.disconnect();
                requestAnimationFrame(tick);
              }
            });
          }, { threshold: 0.15 });

          io.observe(scene);
        })();


        (function () {
          var body = document.getElementById('df-body');
          var replayBtn = document.getElementById('df-replay');
          if (!body) return;

          /* Scripted exchange — three Q/A turns. The candidate's responses
             type out character-by-character to feel live. */
          var TURNS = [
            {
              q: "Your 'best' sort uses a Wilson score. Walk me through why that's the right formula here, not just the obvious win-rate.",
              a: "Raw win-rate breaks on low-vote posts — a take with one win out of one matchup ranks above one with 80 wins out of 100. Wilson gives a confidence-adjusted lower bound, so new posts start conservatively and earn their rank. The AI suggested it and I verified the math against the Wikipedia derivation before wiring it in."
            },
            {
              q: "The AI wrote your 'hot' ranking formula. You accepted it unchanged. Why?",
              a: "I read it carefully — it multiplies win-rate by a recency decay on the most recent vote timestamp. The decay constant it chose was arbitrary, so I tested a few values against the seed data to make sure recent takes actually surfaced. I kept it because it behaved correctly, not because the AI said so."
            },
            {
              q: "If vote volume grew 100× and the leaderboard started timing out, where in ranking.py would you look first?",
              a: "The 'controversial' sort does a full-table pass to compute win/loss splits — no index on votes. I'd add a composite index on winner_id and loser_id, then consider caching the leaderboard with a short TTL since staleness of a few seconds is acceptable. I flagged this in a comment but didn't over-engineer it for the current scale."
            }
          ];

          var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

          /* Track every pending timeout so replay can cancel mid-flight */
          var timers = [];
          function later(fn, ms) {
            var id = setTimeout(function () {
              timers = timers.filter(function (t) { return t !== id; });
              fn();
            }, ms);
            timers.push(id);
            return id;
          }
          function clearTimers() {
            timers.forEach(clearTimeout);
            timers = [];
          }

          function el(tag, cls, html) {
            var e = document.createElement(tag);
            if (cls) e.className = cls;
            if (html != null) e.innerHTML = html;
            return e;
          }

          function appendQuestion(turn, done) {
            var msg = el('div', 'df-msg tenx');
            msg.innerHTML =
              '<span class="role">TenX AI · question</span>' +
              '<span class="body"></span>';
            msg.querySelector('.body').textContent = turn.q;
            body.appendChild(msg);
            requestAnimationFrame(function () { msg.classList.add('in'); });
            body.scrollTop = body.scrollHeight;
            later(done, reduced ? 0 : 700);
          }

          function appendAnswer(turn, done) {
            var msg = el('div', 'df-msg you');
            msg.innerHTML =
              '<span class="role">Candidate · response</span>' +
              '<span class="body typing"></span>';
            body.appendChild(msg);
            requestAnimationFrame(function () { msg.classList.add('in'); });
            var bodyEl = msg.querySelector('.body');
            if (reduced) {
              bodyEl.textContent = turn.a;
              bodyEl.classList.remove('typing');
              return done();
            }
            // Typewriter — ~22 chars/sec with jitter feels human
            var i = 0, txt = turn.a;
            function tick() {
              bodyEl.textContent = txt.slice(0, ++i);
              body.scrollTop = body.scrollHeight;
              if (i < txt.length) {
                later(tick, 22 + Math.random() * 18);
              } else {
                bodyEl.classList.remove('typing');
                later(done, 500);
              }
            }
            tick();
          }

          function playTurn(idx) {
            if (idx >= TURNS.length) return finish();
            appendQuestion(TURNS[idx], function () {
              appendAnswer(TURNS[idx], function () {
                playTurn(idx + 1);
              });
            });
          }

          function finish() {
            var verdict = el('div', 'df-verdict',
              '<span class="label">verdict</span>' +
              'Reasoning grade: <strong style="color:#00E676">4.5/5</strong> · ' +
              'Justifies tradeoffs · Cites evidence · Knows what they didn\'t do.'
            );
            body.appendChild(verdict);
            requestAnimationFrame(function () { verdict.classList.add('in'); });
          }

          /* Replay: cancel pending timers, clear bubbles, replay from turn 0 */
          function play() {
            clearTimers();
            body.innerHTML = '';
            replayBtn.disabled = true;
            playTurn(0);
          }
          // Re-enable replay once verdict appears
          var origFinish = finish;
          finish = function () {
            origFinish();
            replayBtn.disabled = false;
          };
          replayBtn.addEventListener('click', play);

          /* Trigger on scroll-into-view so it plays when the user reaches it. */
          var played = false;
          var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
              if (e.isIntersecting && !played) {
                played = true;
                play();
                io.disconnect();
              }
            });
          }, { threshold: 0.25 });
          io.observe(body);
        })();
