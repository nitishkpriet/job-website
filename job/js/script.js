/* Small JS helpers: mobile nav toggle and basic form validation */

document.addEventListener('DOMContentLoaded', function () {
  // Set year in footer spots
  var year = new Date().getFullYear();
  ['year','year-footer','year-dash','year-skills','year-courses','year-jobs','year-progress'].forEach(function(id){
    var el = document.getElementById(id); if(el) el.textContent = year;
  });

  // Mobile nav toggle
  var navToggle = document.getElementById('navToggle');
  var mainNav = document.getElementById('mainNav');
  if(navToggle && mainNav){
    navToggle.addEventListener('click', function(){
      var expanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', String(!expanded));
      mainNav.classList.toggle('open');
    });
  }

  // Simple client-side login validation (progressive enhancement)
  var loginForm = document.getElementById('loginForm');
  if(loginForm){
    loginForm.addEventListener('submit', function(e){
      var email = loginForm.querySelector('#email');
      var password = loginForm.querySelector('#password');
      if(!email.value || !password.value){
        e.preventDefault();
        alert('Please enter both email and password.');
        email.focus();
      }
    });
  }

  // Basic signup validation: check required fields and confirm password match
  var signupForm = document.getElementById('signupForm');
  if(signupForm){
    signupForm.addEventListener('submit', function(e){
      var email = signupForm.querySelector('#email');
      var password = signupForm.querySelector('#password');
      var confirm = signupForm.querySelector('#confirm');
      if(!email.value || !password.value || !confirm.value){
        e.preventDefault();
        alert('Please complete all fields.');
        email.focus();
        return;
      }
      if(password.value !== confirm.value){
        e.preventDefault();
        alert('Passwords do not match.');
        password.focus();
      }
    });
  }

  // Animate dashboard progress bars (reads data-progress attribute)
  var progressFills = document.querySelectorAll('.progress-fill');
  if(progressFills.length){
    progressFills.forEach(function(fill){
      var p = parseInt(fill.getAttribute('data-progress')) || 0;
      fill.style.width = '0%';
      setTimeout(function(){
        fill.style.transition = 'width 900ms ease';
        fill.style.width = p + '%';
      }, 80);
    });
  }

  // Skills selection persistence (localStorage)
  var skillsForm = document.getElementById('skillsForm');
  var saveBtn = document.getElementById('saveSkills');
  var savedIndicator = document.getElementById('savedSkillsCount');
  var skillsFeedback = document.getElementById('skillsFeedback');

  function loadSavedSkills(){
    try{
      var data = JSON.parse(localStorage.getItem('selectedSkills')) || [];
      document.querySelectorAll('input[name="skills"]').forEach(function(cb){ cb.checked = data.indexOf(cb.value) !== -1; });
      if(savedIndicator) savedIndicator.textContent = data.length;
      if(skillsFeedback) skillsFeedback.textContent = '';
    }catch(e){ console.error('Unable to load saved skills', e); }
  }

  function saveSkills(){
    var selected = Array.from(document.querySelectorAll('input[name="skills"]:checked')).map(function(i){ return i.value });
    try{
      localStorage.setItem('selectedSkills', JSON.stringify(selected));
      if(savedIndicator) savedIndicator.textContent = selected.length;
      if(skillsFeedback){ skillsFeedback.textContent = 'Saved ' + selected.length + ' skills.'; }

      // Small visual toast
      var toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = 'Skills saved';
      Object.assign(toast.style, { position: 'fixed', right: '1rem', bottom: '1rem', background:'#0b74d1', color:'#fff', padding:'0.6rem 0.9rem', borderRadius:'8px', boxShadow:'0 6px 18px rgba(12,15,22,0.12)', opacity: '0', transition: 'opacity .18s' });
      document.body.appendChild(toast);
      setTimeout(function(){ toast.style.opacity = '1'; }, 20);
      setTimeout(function(){ toast.style.opacity = '0'; setTimeout(function(){ try{ document.body.removeChild(toast); }catch(e){} }, 220); }, 1900);
    }catch(e){ console.error('Unable to save skills', e); }
  }

  if(typeof loadSavedSkills === 'function') loadSavedSkills();
  if(saveBtn){ saveBtn.addEventListener('click', function(e){ e.preventDefault(); saveSkills(); }); }

  // Course recommendations: static mapping from skills to courses
  var skillCourseMap = {
    'Python': [
      {title: 'Python for Data Analysis', length: '8 lessons', level: 'Intermediate'},
      {title: 'Automating Tasks with Python', length: '5 lessons', level: 'Beginner'}
    ],
    'Java': [
      {title: 'Core Java Essentials', length: '10 lessons', level: 'Beginner'},
      {title: 'Java Spring Fundamentals', length: '6 lessons', level: 'Intermediate'}
    ],
    'SQL': [
      {title: 'SQL for Data Queries', length: '7 lessons', level: 'Beginner'},
      {title: 'Advanced SQL & Performance', length: '6 lessons', level: 'Advanced'}
    ],
    'Communication': [
      {title: 'Effective Communication', length: '4 lessons', level: 'Beginner'},
      {title: 'Presentation Skills', length: '3 lessons', level: 'Beginner'}
    ],
    'UI/UX': [
      {title: 'Intro to UI Design', length: '6 lessons', level: 'Beginner'},
      {title: 'UX Research Essentials', length: '5 lessons', level: 'Intermediate'}
    ]
  };

  function renderRecommendations(){
    var container = document.getElementById('recommendations');
    if(!container) return;
    var saved = JSON.parse(localStorage.getItem('selectedSkills')) || [];
    container.innerHTML = '';
    if(!saved.length){
      container.innerHTML = '<div class="muted">No skills selected yet. <a href="skills_select.html">Select skills</a> to get tailored course recommendations.</div>';
      return;
    }

    // Build a simple list of unique course suggestions
    var seen = {};
    var cards = document.createDocumentFragment();
    saved.forEach(function(skill){
      var courses = skillCourseMap[skill] || [];
      courses.forEach(function(c){
        var key = c.title;
        if(seen[key]) return; seen[key] = true;

        var article = document.createElement('article');
        article.className = 'course-card';
        article.innerHTML = '<h3>' + c.title + '</h3><p>' + (c.length || '') + '</p>' +
          '<div class="course-meta"><span class="course-badge">' + (c.level || '') + '</span><a class="btn btn-secondary" href="#">View</a></div>';
        cards.appendChild(article);
      });
    });

    container.appendChild(cards);
  }

  // Run on load if on recommendations page
  renderRecommendations();

  // Static mapping of skills to job suggestions and renderer
  var skillJobMap = {
    'Python': [
      {title: 'Data Analyst', company: 'Company X', location: 'Remote', skills: ['Python','SQL']},
      {title: 'Automation Engineer', company: 'Company Y', location: 'Remote', skills: ['Python']}
    ],
    'Java': [
      {title: 'Backend Developer', company: 'Company Z', location: 'Onsite', skills: ['Java','SQL']},
      {title: 'Android Engineer', company: 'Company A', location: 'Remote', skills: ['Java']}
    ],
    'SQL': [
      {title: 'Database Developer', company: 'Company B', location: 'Onsite', skills: ['SQL']}
    ],
    'Communication': [
      {title: 'Client Success Specialist', company: 'Company C', location: 'Remote', skills: ['Communication']}
    ],
    'UI/UX': [
      {title: 'UI Designer', company: 'Company D', location: 'Remote', skills: ['UI/UX']},
      {title: 'UX Researcher', company: 'Company E', location: 'Onsite', skills: ['UI/UX','Communication']}
    ]
  };

  function renderJobs(){
    var container = document.getElementById('jobRecommendations');
    if(!container) return;
    var saved = JSON.parse(localStorage.getItem('selectedSkills')) || [];
    container.innerHTML = '';
    if(!saved.length){
      container.innerHTML = '<div class="muted">No skills selected yet. <a href="skills_select.html">Select skills</a> to get job suggestions.</div>';
      return;
    }

    var seen = {};
    var frag = document.createDocumentFragment();
    saved.forEach(function(skill){
      var jobs = skillJobMap[skill] || [];
      jobs.forEach(function(j){
        var key = j.title + '|' + j.company;
        if(seen[key]) return; seen[key] = true;

        var article = document.createElement('article');
        article.className = 'job-card';
        var skillsHtml = (j.skills || []).map(function(s){ return '<span class="job-skill-tag">'+s+'</span>'; }).join(' ');
        article.innerHTML = '<h3>' + j.title + '</h3><div class="muted">' + j.company + ' — ' + j.location + '</div>' +
          '<div class="job-meta"><div class="job-skills">' + skillsHtml + '</div><button class="btn btn-primary job-apply" aria-disabled="true">Apply</button></div>';
        frag.appendChild(article);
      });
    });

    container.appendChild(frag);
  }

  // Run job renderer on load if on jobs recommendations page
  renderJobs();

  // Progress tracker simulation
  (function(){
    var p1 = document.getElementById('p1');
    var p2 = document.getElementById('p2');
    var p3 = document.getElementById('p3');
    var overallFill = document.querySelector('.progress-bar-fill');
    var overallBar = document.getElementById('overallBar');
    var overallPerc = document.getElementById('overallPercentage');
    var simulateBtn = document.getElementById('simulateBtn');
    var resetBtn = document.getElementById('resetProgress');

    if(p1 || p2 || p3){
      var initial = [(p1?parseInt(p1.value):0),(p2?parseInt(p2.value):0),(p3?parseInt(p3.value):0)];
      var intervalId = null;

      function updateUI(){
        var bars = [p1,p2,p3].filter(Boolean);
        var sum = 0;
        bars.forEach(function(b){ sum += parseInt(b.value) || 0; });
        var avg = bars.length ? Math.round(sum / bars.length) : 0;
        if(overallFill) overallFill.style.width = avg + '%';
        if(overallBar) overallBar.setAttribute('aria-valuenow', avg);
        if(overallPerc) overallPerc.textContent = avg + '%';

        // Update per-course percentage text
        document.querySelectorAll('.course-progress-list li').forEach(function(li, idx){
          var b = [p1,p2,p3][idx];
          var span = li.querySelector('.muted');
          if(span && b) span.textContent = (parseInt(b.value)||0) + '%';
        });

        // Completed courses
        var completedList = document.getElementById('completedList');
        if(completedList){
          completedList.innerHTML = '';
          var courseNames = ['Responsive Design Basics','Advanced JavaScript','Accessibility Fundamentals'];
          bars.forEach(function(b,i){ if((parseInt(b.value)||0) >= 100){ var li = document.createElement('li'); li.textContent = courseNames[i]; completedList.appendChild(li); } });
        }
      }

      function stepOnce(){
        [p1,p2,p3].forEach(function(b, idx){ if(!b) return; var v = parseInt(b.value)||0; if(v>=100) return; var inc = Math.floor(Math.random()*10)+5; b.value = Math.min(100, v+inc); });
        updateUI();
        var allDone = [p1,p2,p3].filter(Boolean).every(function(b){ return parseInt(b.value) >= 100; });
        if(allDone && intervalId){ clearInterval(intervalId); intervalId = null; if(simulateBtn) simulateBtn.textContent = 'Simulate Progress'; }
      }

      if(simulateBtn){
        simulateBtn.addEventListener('click', function(){
          if(intervalId){ clearInterval(intervalId); intervalId = null; simulateBtn.textContent = 'Simulate Progress'; }
          else{ simulateBtn.textContent = 'Stop'; intervalId = setInterval(stepOnce, 900); }
        });
      }

      if(resetBtn){
        resetBtn.addEventListener('click', function(){
          if(intervalId){ clearInterval(intervalId); intervalId = null; if(simulateBtn) simulateBtn.textContent = 'Simulate Progress'; }
          [p1,p2,p3].forEach(function(b,i){ if(b) b.value = initial[i]; });
          updateUI();
        });
      }

      // Initial update
      updateUI();
    }
  })();

});
