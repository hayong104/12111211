import './style.css'

const app = document.querySelector('#app')

// 처음 화면(조건 선택 화면) 그리기
function renderHome() {
  app.innerHTML = `
    <main class="page">
      ${renderKeyStatus()}
      <header class="page-header">
        <h1>평행사변형이 될 조건</h1>
        <p class="page-subtitle">
          아래에서 오늘 활동에서 확인해 볼 조건을 선택해 보세요.
        </p>
      </header>

      <section class="condition-section">
        <h2 class="section-title">활동해서 확인할 조건 선택</h2>

        <div class="condition-grid">
          <button class="condition-card condition-card--disabled" data-condition="1" disabled>
            <div class="condition-label">조건 1</div>
            <div class="condition-text">
              두 쌍의 대변이 각각 평행하다.
            </div>
            <div class="condition-tag">기본 활동</div>
          </button>

          <button class="condition-card condition-card--disabled" data-condition="2" disabled>
            <div class="condition-label">조건 2</div>
            <div class="condition-text">
              두 쌍의 대변의 길이가 각각 같다.
            </div>
            <div class="condition-tag">길이 비교</div>
          </button>

          <button class="condition-card condition-card--disabled" data-condition="3" disabled>
            <div class="condition-label">조건 3</div>
            <div class="condition-text">
              두 쌍의 대각의 크기가 각각 같다.
            </div>
            <div class="condition-tag">각도 탐구</div>
          </button>

          <button class="condition-card condition-card--disabled" data-condition="4" disabled>
            <div class="condition-label">조건 4</div>
            <div class="condition-text">
              두 대각선이 서로 다른 것을 이등분한다.
            </div>
            <div class="condition-tag">대각선 탐구</div>
          </button>

          <button class="condition-card" data-condition="5">
            <div class="condition-label">조건 5</div>
            <div class="condition-text">
              한 쌍의 대변이 평행하고, 그 길이가 같다.
            </div>
            <div class="condition-tag">한 쌍의 대변</div>
          </button>
    </div>

        <p class="helper-text">
          * 마음에 드는 조건을 하나 골라 누른 뒤, 이 조건이 성립하는 도형이 어떤 모습인지
          함께 이야기해 보세요.
        </p>
      </section>
    </main>
  `

  attachHomeEvents()
}

// 각 조건 카드 클릭 시 활동 화면으로 이동
function attachHomeEvents() {
  const buttons = document.querySelectorAll('.condition-card:not(.condition-card--disabled)')
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.condition
      renderActivity(id)
    })
  })
}

// 조건 정보
const conditions = {
  1: {
    title: '조건 1',
    description: '두 쌍의 대변이 각각 평행하다.',
  },
  2: {
    title: '조건 2',
    description: '두 쌍의 대변의 길이가 각각 같다.',
  },
  3: {
    title: '조건 3',
    description: '두 쌍의 대각의 크기가 각각 같다.',
  },
  4: {
    title: '조건 4',
    description: '두 대각선이 서로 다른 것을 이등분한다.',
  },
  5: {
    title: '조건 5',
    description: '한 쌍의 대변이 평행하고, 그 길이가 같다.',
  },
}

// 활동 상태 (선택된 점, 실행 기록, 사각형 꼭짓점, 평행선 자, 챗봇)
const activityState = {
  selectedPoint: null,
  actions: [],
  vertices: [],
  quadShape: null,
  orderedVertices: null, // 정렬된 꼭짓점
  parallelRulers: [],
  chatMessages: [],
  isSending: false,
  chatUnlocked: false,
  currentCondition: null,
  lengthLabels: [], // 길이 라벨
  angleLabels: [], // 각도 라벨
  diagonals: [], // 대각선
  eraserMode: false, // 지우개 모드
}

// 활동 화면
function renderActivity(conditionId) {
  const condition = conditions[conditionId]

  activityState.selectedPoint = null
  activityState.actions = []
  activityState.vertices = []
  activityState.quadShape = null
  activityState.parallelRulers = []
  activityState.chatMessages = []
  activityState.isSending = false
  activityState.chatUnlocked = false
  activityState.currentCondition = conditionId
  
  // 기존 미니어처 창 제거
  const existingMiniature = document.getElementById('miniature-activity-window')
  if (existingMiniature) {
    existingMiniature.remove()
  }

  app.innerHTML = `
    <main class="page activity-page">
      ${renderKeyStatus()}
      <header class="page-header activity-header">
        <button type="button" class="back-button">
          ← 조건 선택으로 돌아가기
        </button>
        <div class="activity-titles">
          <h1>평행사변형 탐구 활동</h1>
          <p class="page-subtitle">
            선택한 조건: <strong>${condition.title}</strong>
          </p>
          <p class="activity-condition-text">
            ${condition.description}
    </p>
  </div>
      </header>

      <section class="activity-body">
        <div class="activity-main">
          <div id="grid-container" class="grid-container"></div>
        </div>

        <aside class="activity-side">
          <h2 class="section-title">활동 방법</h2>
          <ol class="activity-steps">
            <li>격자 위의 점을 한 번 클릭하여 첫 번째 점을 정합니다.</li>
            <li>다른 격자점을 한 번 더 클릭하면 두 점을 잇는 선분이 만들어집니다.</li>
            <li>이 과정을 반복하여 평행사변형이 될 수 있는 모양을 스스로 만들어 봅니다.</li>
            <li>실수했다면 <strong>"이전 선분 지우기"</strong> 버튼으로 한 단계씩 되돌릴 수 있습니다.</li>
            <li>처음부터 다시 하고 싶다면 <strong>“모두 지우기”</strong> 버튼을 눌러 전체를 지웁니다.</li>
          </ol>

          <div class="activity-controls">
            <button type="button" id="undo-segment-button" class="control-button">
              이전 선분 지우기
            </button>
            <button
              type="button"
              id="make-quad-button"
              class="control-button control-button--secondary"
              disabled
            >
              사각형 만들기
            </button>
            <button type="button" id="reset-button" class="control-button control-button--secondary">
              모두 지우기
            </button>
          </div>
        </aside>
      </section>

      <section class="chat-section" style="display: none;">
        <div class="condition-check-section">
          <div class="chat-header">
            <div class="chat-title">조건 확인</div>
          </div>
          <div id="chat-status" class="chat-status">사각형을 만든 후 조건 확인을 진행하세요.</div>
          <button id="chat-check" type="button" class="control-button chat-check" disabled>
            조건에 맞는지 확인하기
          </button>
          <div id="condition-result" class="condition-result"></div>
          <button id="condition-complete-btn" type="button" class="control-button condition-complete-btn" style="display: none; margin-top: 12px;" disabled>
            조건 확인 완료
          </button>
        </div>
        
        <div class="chat-panel" id="chat-panel" style="display: none; margin-top: 20px;">
          <div class="chat-header">
            <div class="chat-title">AI와 대화하기</div>
            <div class="chat-hint">질문에 대한 답변을 받을 수 있습니다.</div>
          </div>
          <div id="chat-log" class="chat-log"></div>
          <form id="chat-form" class="chat-form">
            <input
              id="chat-input"
              class="chat-input"
              type="text"
              name="message"
              placeholder="질문을 입력하세요"
              required
              autocomplete="off"
              disabled
            />
            <button id="chat-send" type="submit" class="control-button chat-send" disabled>질문 보내기</button>
          </form>
        </div>
        
        <div class="quad-info-section" id="quad-info-section" style="display: none; margin-top: 20px;">
          <h2 class="section-title">사각형에 대한 정보 확인하기</h2>
          <div id="quad-preview-container" class="quad-preview-container" style="margin-bottom: 16px;"></div>
          <div class="info-controls">
            <button type="button" id="info-show-lengths-btn" class="control-button">네 변의 길이</button>
            <button type="button" id="info-show-angles-btn" class="control-button">네 내각의 크기</button>
            <button type="button" id="info-show-diagonals-btn" class="control-button">두 대각선의 관계 확인</button>
            <button type="button" id="info-show-parallel-btn" class="control-button">대변의 평행 여부 확인</button>
          </div>
          <div id="info-results" class="analysis-results"></div>
          <button type="button" id="info-next-btn" class="control-button" style="margin-top: 12px; display: none;">
            다음 단계: 평행사변형 판단하기
          </button>
        </div>
        
        <div id="parallelogram-judgment" class="parallelogram-judgment" style="display: none; margin-top: 20px;">
          <div class="judgment-question">만든 사각형이 평행사변형인가요?</div>
          <div class="judgment-buttons">
            <button id="judgment-yes-btn" type="button" class="control-button judgment-btn">맞아요</button>
            <button id="judgment-no-btn" type="button" class="control-button judgment-btn">아니에요</button>
            <button id="judgment-unknown-btn" type="button" class="control-button judgment-btn">모르겠어요</button>
          </div>
        </div>
        
        <div class="parallelogram-analysis" id="parallelogram-analysis" style="display: none; margin-top: 20px;">
          <h2 class="section-title">평행사변형이라고 판단한 이유를 작성하세요</h2>
          <div class="judgment-reason-section">
            <textarea
              id="judgment-reason-input"
              class="judgment-reason-textarea"
              placeholder="평행사변형이라고 판단한 이유를 작성해주세요."
              rows="6"
            ></textarea>
            <button type="button" id="judgment-reason-submit-btn" class="control-button" style="margin-top: 12px;">
              작성 완료
            </button>
          </div>
        </div>
      </section>
    </main>
  `

  setupActivityEvents()
  setupChatUI()
}

// 활동 화면 이벤트 연결
function setupActivityEvents() {
  const backButton = document.querySelector('.back-button')
  const resetButton = document.getElementById('reset-button')
  const makeQuadButton = document.getElementById('make-quad-button')
  const gridContainer = document.getElementById('grid-container')

  backButton.addEventListener('click', () => {
    renderHome()
  })

  const svg = createGridSvg()
  gridContainer.appendChild(svg)
  
  // 오른쪽 미니어처 창 생성
  createMiniatureWindow(gridContainer)
  
  // 평행선 자 드래그용 상태
  let draggingRuler = null
  let lastMousePos = null
  // 선분 미리보기용 상태 (객체로 참조 전달)
  const previewLineRef = { current: null }

  // 클릭 이벤트는 지우개 모드와 일반 모드를 구분하여 위에서 처리됨

  // 격자점에 마우스가 올라갔을 때 미리보기 표시
  const points = svg.querySelectorAll('.grid-point')
  points.forEach((point) => {
    point.addEventListener('mouseenter', () => {
      if (activityState.selectedPoint && point !== activityState.selectedPoint && !draggingRuler) {
        const x1 = Number(activityState.selectedPoint.dataset.origX || activityState.selectedPoint.getAttribute('cx') || 0)
        const y1 = Number(activityState.selectedPoint.dataset.origY || activityState.selectedPoint.getAttribute('cy') || 0)
        const x2 = Number(point.dataset.origX || point.getAttribute('cx') || 0)
        const y2 = Number(point.dataset.origY || point.getAttribute('cy') || 0)

        if (!previewLineRef.current) {
          previewLineRef.current = document.createElementNS('http://www.w3.org/2000/svg', 'line')
          previewLineRef.current.classList.add('segment-preview')
          // 회전된 그룹 안에 추가
          const gridGroup = svg.querySelector('g[transform*="rotate"]')
          if (gridGroup) {
            gridGroup.appendChild(previewLineRef.current)
          } else {
            svg.appendChild(previewLineRef.current)
          }
        }
        previewLineRef.current.setAttribute('x1', String(x1))
        previewLineRef.current.setAttribute('y1', String(y1))
        previewLineRef.current.setAttribute('x2', String(x2))
        previewLineRef.current.setAttribute('y2', String(y2))
      }
    })
  })
  
  // 마우스가 격자 밖으로 나갔을 때 미리보기 제거
  svg.addEventListener('mouseleave', () => {
    if (previewLineRef.current) {
      previewLineRef.current.remove()
      previewLineRef.current = null
    }
  })

  // 평행선 자 드래그 시작
  svg.addEventListener('mousedown', (event) => {
    const ruler = event.target.closest('.parallel-ruler')
    if (!ruler) return
    draggingRuler = ruler
    lastMousePos = { x: event.offsetX, y: event.offsetY }
  })

  // 드래그 중 위치 갱신 (평행선 자) - handlePreviewMove와 함께 작동
  const handleRulerMove = (event) => {
    if (draggingRuler && lastMousePos) {
      const dx = event.offsetX - lastMousePos.x
      const dy = event.offsetY - lastMousePos.y

      const x1 = parseFloat(draggingRuler.getAttribute('x1'))
      const y1 = parseFloat(draggingRuler.getAttribute('y1'))
      const x2 = parseFloat(draggingRuler.getAttribute('x2'))
      const y2 = parseFloat(draggingRuler.getAttribute('y2'))

      draggingRuler.setAttribute('x1', String(x1 + dx))
      draggingRuler.setAttribute('y1', String(y1 + dy))
      draggingRuler.setAttribute('x2', String(x2 + dx))
      draggingRuler.setAttribute('y2', String(y2 + dy))

      lastMousePos = { x: event.offsetX, y: event.offsetY }
    }
  }
  
  svg.addEventListener('mousemove', handleRulerMove)

  // 드래그 종료
  const stopDrag = () => {
    draggingRuler = null
    lastMousePos = null
  }
  svg.addEventListener('mouseup', stopDrag)
  svg.addEventListener('mouseleave', stopDrag)

  const undoSegmentButton = document.getElementById('undo-segment-button')
  
  if (undoSegmentButton) {
    undoSegmentButton.addEventListener('click', () => {
      handleUndoSegment(svg)
    })
  }
  
  // 일반 모드 클릭 이벤트
  svg.addEventListener('click', (event) => {
    const point = event.target.closest('.grid-point')
    if (!point) return
    handlePointClick(point, svg)
  })
  
  resetButton.addEventListener('click', handleReset)
  makeQuadButton.addEventListener('click', () => handleMakeQuadrilateral(svg))
}

// 격자(SVG) 만들기 - 정삼각형 격자
function createGridSvg() {
  const GRID_ROWS = 7
  const GRID_COLS = 7
  const TRIANGLE_SIDE = 35 // 정삼각형 한 변의 길이
  const PADDING = 10
  const ROTATION_ANGLE = 18 // 격자 회전 각도 (도)

  // 정삼각형의 높이
  const TRIANGLE_HEIGHT = TRIANGLE_SIDE * Math.sqrt(3) / 2
  
  // 격자 크기 계산
  const width = PADDING * 2 + TRIANGLE_SIDE * (GRID_COLS - 1) + TRIANGLE_SIDE / 2
  const height = PADDING * 2 + TRIANGLE_HEIGHT * (GRID_ROWS - 1) + TRIANGLE_HEIGHT

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
  svg.setAttribute('width', '100%')
  svg.setAttribute('height', '100%')
  svg.classList.add('grid-svg')
  
  // 보조선(격자선) 제거 - 격자점만 표시

  // 격자점 (작은 원형 점) - 회전 그룹 밖에 배치, 정삼각형 격자의 꼭짓점에 배치
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      // 홀수 행은 오프셋 적용
      const offsetX = (r % 2 === 1) ? TRIANGLE_SIDE / 2 : 0
      const x = PADDING + TRIANGLE_SIDE * c + offsetX
      const y = PADDING + TRIANGLE_HEIGHT * r

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      circle.setAttribute('cx', x)
      circle.setAttribute('cy', y)
      circle.setAttribute('r', 2.5)
      circle.classList.add('grid-point')
      circle.dataset.row = String(r)
      circle.dataset.col = String(c)
      // 원래 좌표 저장
      circle.dataset.origX = String(x)
      circle.dataset.origY = String(y)
      // 회전 그룹 밖에 추가
      svg.appendChild(circle)
      
      // 아래쪽 삼각형의 꼭짓점도 추가
      if (r < GRID_ROWS - 1) {
        const y2 = y + TRIANGLE_HEIGHT
        const circle2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
        circle2.setAttribute('cx', x)
        circle2.setAttribute('cy', y2)
        circle2.setAttribute('r', 2.5)
        circle2.classList.add('grid-point')
        circle2.dataset.row = String(r + 0.5)
        circle2.dataset.col = String(c)
        circle2.dataset.origX = String(x)
        circle2.dataset.origY = String(y2)
        svg.appendChild(circle2)
      }
    }
  }

  return svg
}

// 오른쪽 미니어처 창 생성
function createMiniatureWindow(gridContainer) {
  // 기존 미니어처 창이 있으면 제거
  const existingWindow = document.getElementById('miniature-activity-window')
  if (existingWindow) {
    existingWindow.remove()
  }
  
  // 미니어처 창 생성
  const miniatureWindow = document.createElement('div')
  miniatureWindow.id = 'miniature-activity-window'
  miniatureWindow.className = 'miniature-activity-window'
  miniatureWindow.innerHTML = `
    <div class="miniature-window-header">
      <h3>활동 사각형</h3>
    </div>
    <div class="miniature-window-content"></div>
  `
  document.body.appendChild(miniatureWindow)
  
  // 미니어처 내용 초기화
  const miniatureContent = miniatureWindow.querySelector('.miniature-window-content')
  updateMiniatureContent(gridContainer, miniatureContent)
  
  // 스크롤 이벤트로 위치 업데이트 (스크롤 위치에 따라 같이 이동)
  let baseScrollY = window.scrollY
  const updateMiniaturePosition = () => {
    if (miniatureWindow.style.display === 'none') return
    const scrollY = window.scrollY
    const deltaY = scrollY - baseScrollY
    baseScrollY = scrollY
    
    const currentTop = parseFloat(miniatureWindow.style.top) || 80
    const maxTop = window.innerHeight - miniatureWindow.offsetHeight - 20
    const minTop = 20
    const newTop = Math.max(minTop, Math.min(maxTop, currentTop + deltaY))
    miniatureWindow.style.top = `${newTop}px`
    miniatureWindow.style.right = '20px'
  }
  
  window.addEventListener('scroll', updateMiniaturePosition)
  
  // 초기 위치 설정
  updateMiniaturePosition()
  
  // 그리기 활동이 업데이트될 때마다 미니어처도 업데이트
  const observer = new MutationObserver(() => {
    updateMiniatureContent(gridContainer, miniatureContent)
  })
  
  observer.observe(gridContainer, { childList: true, subtree: true })
  
  // 주기적으로 미니어처 업데이트 (SVG 변경 감지)
  const updateInterval = setInterval(() => {
    if (!document.getElementById('miniature-activity-window')) {
      clearInterval(updateInterval)
      return
    }
    updateMiniatureContent(gridContainer, miniatureContent)
  }, 300)
}

// 미니어처 내용 업데이트
function updateMiniatureContent(gridContainer, miniatureContent) {
  if (!gridContainer || !miniatureContent) return
  
  const existingClone = miniatureContent.querySelector('.grid-container')
  if (existingClone) {
    existingClone.remove()
  }
  
  const gridClone = gridContainer.cloneNode(true)
  const svg = gridClone.querySelector('svg')
  if (svg) {
    const originalSvg = gridContainer.querySelector('svg')
    if (originalSvg) {
      const viewBox = originalSvg.getAttribute('viewBox') || '0 0 500 500'
      svg.setAttribute('viewBox', viewBox)
      svg.setAttribute('width', '100%')
      svg.setAttribute('height', '100%')
    }
  }
  // 인라인 스타일 제거 (CSS에서 처리)
  gridClone.style.transform = ''
  gridClone.style.transformOrigin = ''
  gridClone.style.width = ''
  gridClone.style.height = ''
  miniatureContent.appendChild(gridClone)
}

// 점 클릭 → 점 선택 / 선분 그리기
function handlePointClick(point, svg) {
  const { selectedPoint } = activityState

  // 사각형 꼭짓점으로 등록 (최대 4개, 중복 클릭은 무시)
  if (activityState.vertices.length < 4) {
    const already = activityState.vertices.some((v) => v.element === point)
    if (!already) {
      const labelChar = String.fromCharCode(65 + activityState.vertices.length) // A, B, C, D
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      // 정삼각형의 중심 좌표 가져오기 (원래 좌표 사용)
      const cx = Number(point.dataset.origX || point.getAttribute('cx') || 0)
      const cy = Number(point.dataset.origY || point.getAttribute('cy') || 0)
      // 점 근처에 라벨 표시 (점 위가 아니라 오른쪽 위)
      text.setAttribute('x', String(cx + 10))
      text.setAttribute('y', String(cy - 10))
      text.classList.add('point-label')
      text.textContent = labelChar
      svg.appendChild(text)

      activityState.vertices.push({
        element: point,
        x: cx,
        y: cy,
        labelEl: text,
      })
    }
  }

  // 네 개의 점이 모였는지에 따라 버튼 활성/비활성
  const makeQuadButton = document.getElementById('make-quad-button')
  if (makeQuadButton) {
    makeQuadButton.disabled = activityState.vertices.length !== 4
  }

  // 첫 번째 점 선택
  if (!selectedPoint) {
    point.classList.add('grid-point--active')
    activityState.selectedPoint = point
    activityState.actions.push({ type: 'select', element: point })
    return
  }

  // 같은 점을 두 번 클릭하면 무시
  if (selectedPoint === point) {
    return
  }

  // 두 번째 점 선택 → 선분 생성
  const x1 = Number(selectedPoint.dataset.origX || selectedPoint.getAttribute('cx') || 0)
  const y1 = Number(selectedPoint.dataset.origY || selectedPoint.getAttribute('cy') || 0)
  const x2 = Number(point.dataset.origX || point.getAttribute('cx') || 0)
  const y2 = Number(point.dataset.origY || point.getAttribute('cy') || 0)

  // 미리보기 선 제거
  const previewLineEl = svg.querySelector('.segment-preview')
  if (previewLineEl) previewLineEl.remove()

  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
  line.setAttribute('x1', x1)
  line.setAttribute('y1', y1)
  line.setAttribute('x2', x2)
  line.setAttribute('y2', y2)
  line.classList.add('segment-line')

  // 회전된 그룹 안에 추가
  const gridGroup = svg.querySelector('g[transform*="rotate"]')
  if (gridGroup) {
    gridGroup.appendChild(line)
  } else {
    svg.appendChild(line)
  }
  // 선분과 연결된 두 점 정보도 저장 (되돌리기 시 라벨 제거용)
  activityState.actions.push({ 
    type: 'segment', 
    element: line,
    point1: selectedPoint,
    point2: point
  })

  selectedPoint.classList.remove('grid-point--active')
  activityState.selectedPoint = null
}

// 지우개 모드: 점 클릭 시 제거
function handleEraserPointClick(point, svg) {
  // 점과 연결된 라벨 찾기
  const vertex = activityState.vertices.find(v => v.element === point)
  if (vertex && vertex.labelEl) {
    vertex.labelEl.remove()
    const index = activityState.vertices.indexOf(vertex)
    if (index > -1) {
      activityState.vertices.splice(index, 1)
    }
  }
  
  // 점과 연결된 선분 찾아서 제거
  const connectedSegments = []
  activityState.actions.forEach((action) => {
    if (action.type === 'segment' && (action.point1 === point || action.point2 === point)) {
      connectedSegments.push(action)
    }
  })
  
  // 연결된 선분 제거 (역순으로 제거하여 인덱스 문제 방지)
  connectedSegments.reverse().forEach((action) => {
    action.element.remove()
    const actionIndex = activityState.actions.indexOf(action)
    if (actionIndex > -1) {
      activityState.actions.splice(actionIndex, 1)
    }
    
    // 선분의 다른 점도 vertices에서 제거
    if (action.point1 && action.point1 !== point) {
      const v1 = activityState.vertices.find(v => v.element === action.point1)
      if (v1 && v1.labelEl) {
        v1.labelEl.remove()
        const idx = activityState.vertices.indexOf(v1)
        if (idx > -1) {
          activityState.vertices.splice(idx, 1)
        }
      }
    }
    if (action.point2 && action.point2 !== point) {
      const v2 = activityState.vertices.find(v => v.element === action.point2)
      if (v2 && v2.labelEl) {
        v2.labelEl.remove()
        const idx = activityState.vertices.indexOf(v2)
        if (idx > -1) {
          activityState.vertices.splice(idx, 1)
        }
      }
    }
  })
  
  // 선택된 점이면 선택 해제
  if (activityState.selectedPoint === point) {
    point.classList.remove('grid-point--active')
    activityState.selectedPoint = null
  }
  
  // 사각형이 있고 꼭짓점이 4개가 아니면 사각형 제거
  if (activityState.quadShape && activityState.vertices.length !== 4) {
    activityState.quadShape.remove()
    activityState.quadShape = null
    activityState.orderedVertices = null
    // 챗봇 섹션 숨기기
    const chatSection = document.querySelector('.chat-section')
    if (chatSection) {
      chatSection.style.display = 'none'
    }
    const chatCheckBtn = document.getElementById('chat-check')
    if (chatCheckBtn) {
      chatCheckBtn.disabled = true
    }
  }
  
  // 버튼 상태 업데이트
  const makeQuadButton = document.getElementById('make-quad-button')
  if (makeQuadButton) {
    makeQuadButton.disabled = activityState.vertices.length !== 4
  }
}

// 이전 선분 지우기
function handleUndoSegment(svg) {
  // 가장 최근의 선분 액션 찾기
  let foundIndex = -1
  for (let i = activityState.actions.length - 1; i >= 0; i--) {
    if (activityState.actions[i].type === 'segment') {
      foundIndex = i
      break
    }
  }
  
  if (foundIndex === -1) return
  
  const last = activityState.actions.splice(foundIndex, 1)[0]
  last.element.remove()
  
  // 선분과 연결된 점들의 라벨 제거
  if (last.point1) {
    const vertex1 = activityState.vertices.find(v => v.element === last.point1)
    if (vertex1 && vertex1.labelEl) {
      vertex1.labelEl.remove()
      const index = activityState.vertices.indexOf(vertex1)
      if (index > -1) {
        activityState.vertices.splice(index, 1)
      }
    }
  }
  if (last.point2) {
    const vertex2 = activityState.vertices.find(v => v.element === last.point2)
    if (vertex2 && vertex2.labelEl) {
      vertex2.labelEl.remove()
      const index = activityState.vertices.indexOf(vertex2)
      if (index > -1) {
        activityState.vertices.splice(index, 1)
      }
    }
  }
  
  // 사각형이 있고 꼭짓점이 4개가 아니면 사각형 제거
  if (activityState.quadShape && activityState.vertices.length !== 4) {
    activityState.quadShape.remove()
    activityState.quadShape = null
    activityState.orderedVertices = null
    // 챗봇 섹션 숨기기
    const chatSection = document.querySelector('.chat-section')
    if (chatSection) {
      chatSection.style.display = 'none'
    }
    const chatCheckBtn = document.getElementById('chat-check')
    if (chatCheckBtn) {
      chatCheckBtn.disabled = true
    }
  }
  
  // 버튼 상태 업데이트
  const makeQuadButton = document.getElementById('make-quad-button')
  if (makeQuadButton) {
    makeQuadButton.disabled = activityState.vertices.length !== 4
  }
}

// 이전 선분 지우기
function handleUndoSegment(svg) {
  // 가장 최근의 선분 액션 찾기
  let foundIndex = -1
  for (let i = activityState.actions.length - 1; i >= 0; i--) {
    if (activityState.actions[i].type === 'segment') {
      foundIndex = i
      break
    }
  }
  
  if (foundIndex === -1) return
  
  const last = activityState.actions.splice(foundIndex, 1)[0]
  last.element.remove()
  
  // 선분과 연결된 점들의 라벨 제거
  if (last.point1) {
    const vertex1 = activityState.vertices.find(v => v.element === last.point1)
    if (vertex1 && vertex1.labelEl) {
      vertex1.labelEl.remove()
      const index = activityState.vertices.indexOf(vertex1)
      if (index > -1) {
        activityState.vertices.splice(index, 1)
      }
    }
  }
  if (last.point2) {
    const vertex2 = activityState.vertices.find(v => v.element === last.point2)
    if (vertex2 && vertex2.labelEl) {
      vertex2.labelEl.remove()
      const index = activityState.vertices.indexOf(vertex2)
      if (index > -1) {
        activityState.vertices.splice(index, 1)
      }
    }
  }
  
  // 사각형이 있고 꼭짓점이 4개가 아니면 사각형 제거
  if (activityState.quadShape && activityState.vertices.length !== 4) {
    activityState.quadShape.remove()
    activityState.quadShape = null
    activityState.orderedVertices = null
    // 챗봇 섹션 숨기기
    const chatSection = document.querySelector('.chat-section')
    if (chatSection) {
      chatSection.style.display = 'none'
    }
    const chatCheckBtn = document.getElementById('chat-check')
    if (chatCheckBtn) {
      chatCheckBtn.disabled = true
    }
  }
  
  // 버튼 상태 업데이트
  const makeQuadButton = document.getElementById('make-quad-button')
  if (makeQuadButton) {
    makeQuadButton.disabled = activityState.vertices.length !== 4
  }
}

// 선택한 네 점으로 사각형 그리기
function handleMakeQuadrilateral(svg) {
  if (activityState.vertices.length !== 4) return

  // 기존 사각형이 있다면 제거
  if (activityState.quadShape) {
    activityState.quadShape.remove()
    activityState.quadShape = null
  }

  // 교차하는 선분이 없도록, 꼭짓점을 중심점 기준 각도 순으로 정렬
  const cx =
    activityState.vertices.reduce((sum, v) => sum + v.x, 0) / activityState.vertices.length
  const cy =
    activityState.vertices.reduce((sum, v) => sum + v.y, 0) / activityState.vertices.length

  const ordered = [...activityState.vertices].sort((a, b) => {
    const angleA = Math.atan2(a.y - cy, a.x - cx)
    const angleB = Math.atan2(b.y - cy, b.x - cx)
    return angleA - angleB
  })

  const pointsAttr = ordered.map((v) => `${v.x},${v.y}`).join(' ')

  const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
  polygon.setAttribute('points', pointsAttr)
  polygon.classList.add('quad-polygon')

  // 격자선보다 위, 점보다 아래에 오도록 끝부분에 추가
  svg.appendChild(polygon)
  activityState.quadShape = polygon
  activityState.orderedVertices = ordered // 정렬된 꼭짓점 저장

  // 챗봇 섹션 표시 및 조건 확인 버튼 활성화
  const chatSection = document.querySelector('.chat-section')
  if (chatSection) {
    chatSection.style.display = 'block'
  }
  const chatCheckBtn = document.getElementById('chat-check')
  if (chatCheckBtn) {
    chatCheckBtn.disabled = false
  }
  // 조건 확인 완료 버튼과 평행사변형 판단 입력 창 숨기기
  const conditionCompleteBtn = document.getElementById('condition-complete-btn')
  if (conditionCompleteBtn) {
    conditionCompleteBtn.style.display = 'none'
    conditionCompleteBtn.disabled = true
  }
  const parallelogramJudgment = document.getElementById('parallelogram-judgment')
  if (parallelogramJudgment) {
    parallelogramJudgment.style.display = 'none'
  }
  const analysisSection = document.getElementById('parallelogram-analysis')
  if (analysisSection) {
    analysisSection.style.display = 'none'
  }

  // 평행사변형 판단 이유 작성 섹션은 평행사변형이라고 판단했을 때 표시됨
  
  // 미니어처 창이 있으면 계속 표시
  const miniWindow = document.getElementById('miniature-activity-window')
  if (miniWindow) {
    miniWindow.style.display = 'block'
  }
}

// 전체 초기화
function handleReset() {
  activityState.actions.forEach((action) => {
    if (action.type === 'segment') {
      action.element.remove()
    } else if (action.type === 'select') {
      action.element.classList.remove('grid-point--active')
    }
  })

  activityState.actions = []
  activityState.selectedPoint = null

  // 사각형 및 꼭짓점 정보 초기화
  if (activityState.quadShape) {
    activityState.quadShape.remove()
    activityState.quadShape = null
  }
  activityState.vertices.forEach((v) => {
    if (v.labelEl) v.labelEl.remove()
  })
  activityState.vertices = []

  // 평행선 자 제거
  activityState.parallelRulers.forEach((ruler) => ruler.remove())
  activityState.parallelRulers = []
  activityState.orderedVertices = null

  // 분석 결과 제거
  activityState.lengthLabels.forEach(label => label.remove())
  activityState.lengthLabels = []
  activityState.angleLabels.forEach(label => label.remove())
  activityState.angleLabels = []
  activityState.diagonals.forEach(diag => diag.remove())
  activityState.diagonals = []

  const makeQuadButton = document.getElementById('make-quad-button')
  if (makeQuadButton) {
    makeQuadButton.disabled = true
  }

  // 챗봇 섹션 숨기기
  const chatSection = document.querySelector('.chat-section')
  if (chatSection) {
    chatSection.style.display = 'none'
  }
  const chatCheckBtn = document.getElementById('chat-check')
  if (chatCheckBtn) {
    chatCheckBtn.disabled = true
  }

  // 챗봇 초기화
  activityState.chatMessages = []
  activityState.isSending = false
  activityState.chatUnlocked = false
  const chatLog = document.getElementById('chat-log')
  if (chatLog) chatLog.innerHTML = ''
  const chatStatus = document.getElementById('chat-status')
  if (chatStatus) chatStatus.textContent = '사각형을 만든 후 조건 확인을 진행하세요.'
  const conditionResult = document.getElementById('condition-result')
  if (conditionResult) conditionResult.innerHTML = ''
  const chatInput = document.getElementById('chat-input')
  const chatSend = document.getElementById('chat-send')
  if (chatInput) chatInput.disabled = true
  if (chatSend) chatSend.disabled = true
  const chatPanel = document.getElementById('chat-panel')
  if (chatPanel) chatPanel.style.display = 'none'
  
  // 고정 창 숨기기
  const fixedWindow = document.getElementById('fixed-activity-window')
  if (fixedWindow) {
    fixedWindow.style.display = 'none'
  }
  
  // 미니어처 창 숨기기
  const miniatureWindow = document.getElementById('miniature-activity-window')
  if (miniatureWindow) {
    miniatureWindow.style.display = 'none'
  }
}

// 시작 시 처음 화면 보여주기
renderHome()

// ----- 챗봇 UI / API -----

function renderKeyStatus() {
  const hasKey = !!import.meta.env.VITE_OPENAI_API_KEY
  return `
    <div class="key-status ${hasKey ? 'key-ok' : 'key-missing'}">
      <span class="key-dot"></span>
      ${hasKey ? 'API Key 감지됨 (VITE_OPENAI_API_KEY)' : 'API Key가 설정되지 않았습니다 (.env를 확인하세요)'}
    </div>
  `
}

function setupChatUI() {
  const form = document.getElementById('chat-form')
  const input = document.getElementById('chat-input')
  const sendBtn = document.getElementById('chat-send')
  const log = document.getElementById('chat-log')
  const checkBtn = document.getElementById('chat-check')
  const status = document.getElementById('chat-status')
  if (!form || !input || !sendBtn || !log || !checkBtn || !status) return

  const setChatEnabled = (enabled) => {
    activityState.chatUnlocked = enabled
    input.disabled = !enabled
    sendBtn.disabled = !enabled
    status.textContent = enabled
      ? '조건 확인 완료! 자유롭게 질문을 입력하세요.'
      : '먼저 조건 확인 버튼을 눌러 주세요.'
  }

  checkBtn.addEventListener('click', async () => {
    if (activityState.isSending) return
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY
    if (!apiKey) {
      addChatMessage('assistant', 'API Key가 설정되지 않아 요청을 보낼 수 없습니다. .env의 VITE_OPENAI_API_KEY를 확인하세요.')
      return
    }

    activityState.isSending = true
    checkBtn.disabled = true
    status.textContent = '피드백을 작성하는 중입니다...'
    
    // 로딩 인디케이터 표시
    const typingMessage = addChatMessage('assistant', '', true)
    
    try {
      const context = summarizeCurrentWork()
      const autoQuestion = '내가 만든 도형이 선택한 조건을 만족하는지 확인해줘.'
      const reply = await callChatGPT(apiKey, autoQuestion, context)
      
      // 조건 확인 결과를 별도 섹션에 표시
      const conditionResultDiv = document.getElementById('condition-result')
      if (conditionResultDiv && typingMessage) {
        updateTypingMessage(typingMessage, reply)
        // typingMessage를 condition-result로 이동
        conditionResultDiv.innerHTML = ''
        conditionResultDiv.appendChild(typingMessage)
      } else if (conditionResultDiv) {
        const formattedText = reply.split('\n').filter(line => line.trim() !== '').map(line => {
          if (/^\(\d+\)/.test(line.trim())) {
            return `<div class="feedback-item">${line.trim()}</div>`
          }
          return line.trim()
        }).join('<br>')
        conditionResultDiv.innerHTML = formattedText
      }
      
      // AI 대화 패널 표시
      const chatPanel = document.getElementById('chat-panel')
      if (chatPanel) {
        chatPanel.style.display = 'block'
      }
      setChatEnabled(true)
      
      // 조건이 모두 충족되었는지 확인 (답변에 "모든 조건을 만족합니다" 또는 "모든 조건"이 포함되어 있는지 확인)
      const allConditionsMet = reply.includes('모든 조건을 만족') || reply.includes('모든 조건') || 
                               (!reply.includes('부족') && !reply.includes('만족하지') && !reply.includes('아니') && 
                                !reply.includes('평행하지') && !reply.includes('같지'))
      
      // 조건 확인 완료 버튼은 조건을 모두 충족했을 때만 표시
      const conditionCompleteBtn = document.getElementById('condition-complete-btn')
      if (conditionCompleteBtn) {
        if (allConditionsMet) {
          conditionCompleteBtn.style.display = 'block'
          conditionCompleteBtn.disabled = false
        } else {
          conditionCompleteBtn.style.display = 'none'
          conditionCompleteBtn.disabled = true
        }
      }
    } catch (err) {
      if (typingMessage) {
        updateTypingMessage(typingMessage, `오류가 발생했습니다: ${err.message || err}`)
      } else {
        addChatMessage('assistant', `오류가 발생했습니다: ${err.message || err}`)
      }
      checkBtn.disabled = false
      status.textContent = '조건 확인을 다시 시도해 주세요.'
    } finally {
      activityState.isSending = false
    }
  })

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const message = input.value.trim()
    if (!message || activityState.isSending || !activityState.chatUnlocked) return

    addChatMessage('user', message)
    input.value = ''

    const apiKey = import.meta.env.VITE_OPENAI_API_KEY
    if (!apiKey) {
      addChatMessage('assistant', 'API Key가 설정되지 않아 요청을 보낼 수 없습니다. .env의 VITE_OPENAI_API_KEY를 확인하세요.')
      return
    }

    activityState.isSending = true
    sendBtn.disabled = true
    
    // 로딩 인디케이터 표시
    const typingMessage = addChatMessage('assistant', '', true)
    
    try {
      const context = summarizeCurrentWork()
      // 조건 확인 완료 후 질문이므로 친근한 대화 형태로 답변
      const reply = await callChatGPT(apiKey, message, context, true)
      updateTypingMessage(typingMessage, reply)
    } catch (err) {
      if (typingMessage) {
        updateTypingMessage(typingMessage, `오류가 발생했습니다: ${err.message || err}`)
      } else {
        addChatMessage('assistant', `오류가 발생했습니다: ${err.message || err}`)
      }
    } finally {
      activityState.isSending = false
      sendBtn.disabled = false
    }
  })

  // 조건 확인 완료 버튼과 평행사변형 판단 입력 창 이벤트
  const conditionCompleteBtn = document.getElementById('condition-complete-btn')
  const parallelogramJudgment = document.getElementById('parallelogram-judgment')

  // 조건 확인 완료 버튼 클릭
  if (conditionCompleteBtn) {
    conditionCompleteBtn.addEventListener('click', () => {
      // 사각형 정보 확인 섹션 표시
      const quadInfoSection = document.getElementById('quad-info-section')
      if (quadInfoSection) {
        quadInfoSection.style.display = 'block'
        setupQuadInfoSection()
      }
      conditionCompleteBtn.disabled = true
    })
  }

  // 평행사변형 판단 버튼 이벤트
  const judgmentYesBtn = document.getElementById('judgment-yes-btn')
  const judgmentNoBtn = document.getElementById('judgment-no-btn')
  const judgmentUnknownBtn = document.getElementById('judgment-unknown-btn')

  if (judgmentYesBtn) {
    judgmentYesBtn.addEventListener('click', () => {
      // 평행사변형이라고 답한 경우 - 평행사변형 판단 이유 작성 파트 표시
      const analysisSection = document.getElementById('parallelogram-analysis')
      if (analysisSection) {
        analysisSection.style.display = 'block'
        setupJudgmentReasonSection()
      }
      parallelogramJudgment.style.display = 'none'
    })
  }

  if (judgmentNoBtn) {
    judgmentNoBtn.addEventListener('click', () => {
      alert('평행사변형이 되는 조건을 생각해보세요.')
    })
  }

  if (judgmentUnknownBtn) {
    judgmentUnknownBtn.addEventListener('click', () => {
      alert('평행사변형이 되는 조건을 생각해보세요.')
    })
  }
}

function addChatMessage(role, text, isTyping = false) {
  const log = document.getElementById('chat-log')
  if (!log) return

  if (!isTyping) {
    activityState.chatMessages.push({ role, text })
  }

  const item = document.createElement('div')
  item.className = `chat-bubble ${role === 'user' ? 'chat-user' : 'chat-assistant'}`
  
  if (isTyping) {
    item.innerHTML = '<span class="typing-indicator">...</span>'
    item.dataset.typing = 'true'
  } else {
    // 텍스트를 줄바꿈 처리하여 표시 (빈 줄 제거)
    const formattedText = text.split('\n').filter(line => line.trim() !== '').map(line => {
      // (1), (2), (3) 같은 형식의 줄은 문단으로 구분
      if (/^\(\d+\)/.test(line.trim())) {
        return `<div class="feedback-item">${line.trim()}</div>`
      }
      return line.trim()
    }).join('<br>')
    item.innerHTML = formattedText
  }
  
  log.appendChild(item)
  log.scrollTop = log.scrollHeight
  return item
}

function updateTypingMessage(messageElement, text) {
  if (messageElement && messageElement.dataset.typing === 'true') {
    // 텍스트를 줄바꿈 처리하여 표시 (빈 줄 제거)
    const formattedText = text.split('\n').filter(line => line.trim() !== '').map(line => {
      // (1), (2), (3) 같은 형식의 줄은 문단으로 구분
      if (/^\(\d+\)/.test(line.trim())) {
        return `<div class="feedback-item">${line.trim()}</div>`
      }
      return line.trim()
    }).join('<br>')
    messageElement.innerHTML = formattedText
    messageElement.dataset.typing = 'false'
    activityState.chatMessages.push({ role: 'assistant', text })
  }
}

// 두 선분이 평행한지 확인
function areParallel(seg1, seg2, tolerance = 0.01) {
  const dx1 = seg1.x2 - seg1.x1
  const dy1 = seg1.y2 - seg1.y1
  const dx2 = seg2.x2 - seg2.x1
  const dy2 = seg2.y2 - seg2.y1
  
  // 수직선 처리
  if (Math.abs(dx1) < tolerance && Math.abs(dx2) < tolerance) return true
  if (Math.abs(dx1) < tolerance || Math.abs(dx2) < tolerance) return false
  
  // 기울기 비교
  const slope1 = dy1 / dx1
  const slope2 = dy2 / dx2
  return Math.abs(slope1 - slope2) < tolerance
}

// 두 선분의 길이 계산
function segmentLength(seg) {
  return Math.hypot(seg.x2 - seg.x1, seg.y2 - seg.y1)
}

// 두 선분이 대변 관계인지 확인 (마주보는 변)
function areOppositeSides(seg1, seg2, allSegments) {
  // 사각형이 만들어져 있고 orderedVertices가 있으면 정확한 대변 판단 사용
  if (activityState.orderedVertices && activityState.orderedVertices.length === 4) {
    const tolerance = 2
    const vertices = activityState.orderedVertices
    
    // 각 선분이 어떤 변에 해당하는지 찾기
    let seg1Edge = -1
    let seg2Edge = -1
    
    for (let i = 0; i < 4; i++) {
      const v1 = vertices[i]
      const v2 = vertices[(i + 1) % 4]
      
      // seg1이 이 변과 일치하는지 확인
      const seg1Matches = (
        (Math.hypot(seg1.x1 - v1.x, seg1.y1 - v1.y) < tolerance && 
         Math.hypot(seg1.x2 - v2.x, seg1.y2 - v2.y) < tolerance) ||
        (Math.hypot(seg1.x1 - v2.x, seg1.y1 - v2.y) < tolerance && 
         Math.hypot(seg1.x2 - v1.x, seg1.y2 - v1.y) < tolerance)
      )
      
      if (seg1Matches && seg1Edge === -1) {
        seg1Edge = i
      }
      
      // seg2가 이 변과 일치하는지 확인
      const seg2Matches = (
        (Math.hypot(seg2.x1 - v1.x, seg2.y1 - v1.y) < tolerance && 
         Math.hypot(seg2.x2 - v2.x, seg2.y2 - v2.y) < tolerance) ||
        (Math.hypot(seg2.x1 - v2.x, seg2.y1 - v2.y) < tolerance && 
         Math.hypot(seg2.x2 - v1.x, seg2.y2 - v1.y) < tolerance)
      )
      
      if (seg2Matches && seg2Edge === -1) {
        seg2Edge = i
      }
    }
    
    // 두 선분이 모두 사각형의 변으로 인식되었고, 대변 관계인지 확인
    if (seg1Edge !== -1 && seg2Edge !== -1) {
      // 대변은 인덱스 차이가 2인 경우 (0-2, 1-3)
      return Math.abs(seg1Edge - seg2Edge) === 2
    }
  }
  
  // 사각형이 없거나 정확히 매칭되지 않은 경우 기존 로직 사용
  // 두 선분의 끝점들
  const seg1P1 = { x: seg1.x1, y: seg1.y1 }
  const seg1P2 = { x: seg1.x2, y: seg1.y2 }
  const seg2P1 = { x: seg2.x1, y: seg2.y1 }
  const seg2P2 = { x: seg2.x2, y: seg2.y2 }
  
  // 두 선분이 공유하는 점이 있는지 확인
  const tolerance = 2
  const sharePoint = (
    (Math.hypot(seg1P1.x - seg2P1.x, seg1P1.y - seg2P1.y) < tolerance) ||
    (Math.hypot(seg1P1.x - seg2P2.x, seg1P1.y - seg2P2.y) < tolerance) ||
    (Math.hypot(seg1P2.x - seg2P1.x, seg1P2.y - seg2P1.y) < tolerance) ||
    (Math.hypot(seg1P2.x - seg2P2.x, seg1P2.y - seg2P2.y) < tolerance)
  )
  
  // 공유하는 점이 있으면 인접한 변이므로 대변이 아님
  if (sharePoint) return false
  
  // 두 선분이 다른 선분들로 연결되어 있는지 확인
  // seg1의 끝점들이 다른 선분들과 연결되어 있고,
  // seg2의 끝점들도 다른 선분들과 연결되어 있으면 대변일 가능성
  const seg1Connected = allSegments.some(s => {
    if (s === seg1 || s === seg2) return false
    const sP1 = { x: s.x1, y: s.y1 }
    const sP2 = { x: s.x2, y: s.y2 }
    return (
      (Math.hypot(seg1P1.x - sP1.x, seg1P1.y - sP1.y) < tolerance) ||
      (Math.hypot(seg1P1.x - sP2.x, seg1P1.y - sP2.y) < tolerance) ||
      (Math.hypot(seg1P2.x - sP1.x, seg1P2.y - sP1.y) < tolerance) ||
      (Math.hypot(seg1P2.x - sP2.x, seg1P2.y - sP2.y) < tolerance)
    )
  })
  
  const seg2Connected = allSegments.some(s => {
    if (s === seg1 || s === seg2) return false
    const sP1 = { x: s.x1, y: s.y1 }
    const sP2 = { x: s.x2, y: s.y2 }
    return (
      (Math.hypot(seg2P1.x - sP1.x, seg2P1.y - sP1.y) < tolerance) ||
      (Math.hypot(seg2P1.x - sP2.x, seg2P1.y - sP2.y) < tolerance) ||
      (Math.hypot(seg2P2.x - sP1.x, seg2P2.y - sP1.y) < tolerance) ||
      (Math.hypot(seg2P2.x - sP2.x, seg2P2.y - sP2.y) < tolerance)
    )
  })
  
  // 두 선분 모두 다른 선분들과 연결되어 있고, 서로 공유점이 없으면 대변일 가능성
  return seg1Connected && seg2Connected
}

function summarizeCurrentWork() {
  const conditionId = activityState.currentCondition
  const condition = conditionId ? conditions[conditionId] : null
  
  // 선분 정보 수집
  const segments = activityState.actions
    .filter((a) => a.type === 'segment')
    .map((a, idx) => {
      const line = a.element
      const seg = {
        id: idx,
        x1: Math.round(Number(line.getAttribute('x1'))),
        y1: Math.round(Number(line.getAttribute('y1'))),
        x2: Math.round(Number(line.getAttribute('x2'))),
        y2: Math.round(Number(line.getAttribute('y2'))),
      }
      seg.length = Math.round(segmentLength(seg))
      return seg
    })

  // 선분 쌍별 분석
  const segmentPairs = []
  for (let i = 0; i < segments.length; i++) {
    for (let j = i + 1; j < segments.length; j++) {
      const seg1 = segments[i]
      const seg2 = segments[j]
      
      segmentPairs.push({
        segment1: { id: seg1.id, points: [[seg1.x1, seg1.y1], [seg1.x2, seg1.y2]], length: seg1.length },
        segment2: { id: seg2.id, points: [[seg2.x1, seg2.y1], [seg2.x2, seg2.y2]], length: seg2.length },
        areParallel: areParallel(seg1, seg2),
        areOppositeSides: areOppositeSides(seg1, seg2, segments),
        sameLength: Math.abs(seg1.length - seg2.length) < 1, // 1픽셀 오차 허용
      })
    }
  }

  return {
    segments: segments.map(s => ({
      id: s.id,
      points: [[s.x1, s.y1], [s.x2, s.y2]],
      length: s.length
    })),
    segmentCount: segments.length,
    segmentPairs,
    condition: condition
      ? { id: conditionId, title: condition.title, description: condition.description }
      : null,
  }
}

async function callChatGPT(apiKey, userMessage, context, isAfterConditionCheck = false) {
  let systemContent
  if (isAfterConditionCheck) {
    // 조건 확인 완료 후 질문 - 친근한 대화 형태
    systemContent = '너는 중학교 2학년 학생들과 대화하는 따뜻하고 친근한 선생님이야. 학생의 질문에 답할 때 너무 바로 본론으로 들어가지 말고, 먼저 학생의 생각을 이해하고 격려하는 말을 해줘. 중학교 2학년 학생과 대화하는 것처럼 친근하고 이해하기 쉽게, 부드럽게 설명해줘. 질문의 의도에 맞게 구체적으로 설명하되, 학생이 편안하게 느낄 수 있도록 따뜻한 톤으로 대화해줘. 선분에 대한 피드백만 해주고, 사각형이 만들어지는지, 평행사변형이 만들어지는지 등은 절대 언급하지 마.'
  } else {
    // 처음 조건 확인 시
    systemContent = '너는 중학교 2학년 학생들에게 설명하는 교사 보조 챗봇이야. 학생의 질문에 직접적으로 답변해줘. 조건에 맞는지 여부를 다시 말하지 말고, 질문에 대한 답만 제공해줘. 질문의 의도에 맞게 구체적으로 설명해줘. 선분에 대한 피드백만 해주고, 사각형이 만들어지는지, 평행사변형이 만들어지는지 등은 절대 언급하지 마.\n\n중요: 만족하지 않는 조건에 대한 피드백만 제공해줘. 만족하는 조건에 대해서는 언급하지 마. 만약 모든 조건을 만족한다면 "모든 조건을 만족합니다"라고만 간단히 말해줘.\n\n피드백을 줄 때는 반드시 다음 세 가지 기준으로 구분해서 설명해줘. 마크다운 형식(**나 * 같은 기호)을 사용하지 말고, 다음과 같은 형식으로 작성해줘:\n\n(1) 대변 관계 확인: 두 선분이 마주보는 변(대변)인지 확인\n\n(2) 평행 여부 확인: 두 선분이 평행한지 확인\n\n(3) 길이 비교: 두 선분의 길이가 같은지 확인\n\n각 선분 쌍에 대해 만족하지 않는 조건만 설명하고, 만족하지 않는 부분이 있으면 어떤 부분이 부족한지 간단히 설명해 줘. 각 항목 사이에는 빈 줄을 넣어서 문단을 구분해줘.'
  }
  
  const messages = [
    {
      role: 'system',
      content: systemContent,
    },
    {
      role: 'user',
      content: isAfterConditionCheck 
        ? `학생이 남긴 질문: ${userMessage}\n\n현재 작업 요약: ${JSON.stringify(context, null, 2)}\n\n학생의 질문에 직접적으로 답변해줘. 중학교 2학년 학생과 대화하는 것처럼 친근하고 이해하기 쉽게 설명해줘. 질문의 의도에 맞게 구체적으로 설명해줘.`
        : `학생이 남긴 질문: ${userMessage}\n\n현재 작업 요약: ${JSON.stringify(context, null, 2)}\n\n위 정보에서 segmentPairs 배열을 참고하여, 학생의 질문에 직접적으로 답변해줘. 조건에 맞는지 여부를 다시 말하지 말고, 질문에 대한 답만 제공해줘. 각 선분 쌍에 대해 다음 세 가지를 확인하되, 질문의 의도에 맞게 답변해줘:\n1. areOppositeSides: 두 선분이 대변 관계인지\n2. areParallel: 두 선분이 평행한지\n3. sameLength: 두 선분의 길이가 같은지\n\n중요: 만족하지 않는 조건에 대한 피드백만 제공해줘. 만족하는 조건에 대해서는 언급하지 마. 만약 모든 조건을 만족한다면 "모든 조건을 만족합니다"라고만 간단히 말해줘. 각 선분 쌍에 대해 만족하지 않는 조건만 설명해줘. 선분들에 대한 피드백만 해주고, 사각형이나 평행사변형에 대한 언급은 하지 마.`,
    },
  ]

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.4,
      max_tokens: 300,
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`API 오류 (${response.status}): ${errText}`)
  }

  const data = await response.json()
  const reply = data.choices?.[0]?.message?.content?.trim()
  if (!reply) throw new Error('API 응답을 읽을 수 없습니다.')
  return reply
}

// 사각형 정보 확인 섹션 설정
function setupQuadInfoSection() {
  const svg = document.querySelector('.grid-svg')
  if (!svg || !activityState.orderedVertices) return
  
  const vertices = activityState.orderedVertices
  const infoResultsDiv = document.getElementById('info-results')
  const quadPreviewContainer = document.getElementById('quad-preview-container')
  if (!infoResultsDiv) return
  
  // 그리기 활동 부분을 오른쪽 고정 창으로 표시
  let fixedWindow = document.getElementById('fixed-activity-window')
  if (!fixedWindow) {
    const gridContainer = document.getElementById('grid-container')
    if (gridContainer) {
      // 고정 창 생성
      fixedWindow = document.createElement('div')
      fixedWindow.id = 'fixed-activity-window'
      fixedWindow.className = 'fixed-activity-window'
      fixedWindow.style.display = 'none'
      fixedWindow.innerHTML = `
        <div class="fixed-window-header">
          <h3>그리기 활동</h3>
        </div>
        <div class="fixed-window-content"></div>
      `
      document.body.appendChild(fixedWindow)
      
      // 그리기 활동 내용 복사
      const fixedContent = fixedWindow.querySelector('.fixed-window-content')
      const gridClone = gridContainer.cloneNode(true)
      fixedContent.appendChild(gridClone)
      
      // 스크롤 이벤트로 위치 업데이트 (스크롤 위치에 따라 같이 이동)
      let baseScrollY = window.scrollY
      const updateFixedWindowPosition = () => {
        if (fixedWindow.style.display === 'none') return
        const scrollY = window.scrollY
        const deltaY = scrollY - baseScrollY
        baseScrollY = scrollY
        
        const currentTop = parseFloat(fixedWindow.style.top) || 80
        const maxTop = window.innerHeight - fixedWindow.offsetHeight - 20
        const minTop = 20
        const newTop = Math.max(minTop, Math.min(maxTop, currentTop + deltaY))
        fixedWindow.style.top = `${newTop}px`
        fixedWindow.style.right = '20px'
      }
      
      window.addEventListener('scroll', updateFixedWindowPosition)
      
      // 초기 위치 설정
      fixedWindow.style.top = '80px'
      fixedWindow.style.right = '20px'
    }
  } else {
    // 이미 존재하면 표시
    fixedWindow.style.display = 'block'
  }
  
  // 미니어처 창 숨기기 (고정 창이 표시되면 미니어처 창 숨김)
  const miniWindow2 = document.getElementById('miniature-activity-window')
  if (miniWindow2) {
    miniWindow2.style.display = 'none'
  }
  
  // 사각형 미리보기 생성
  if (quadPreviewContainer && activityState.quadShape) {
    quadPreviewContainer.innerHTML = ''
    const previewSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    previewSvg.setAttribute('viewBox', svg.getAttribute('viewBox') || '0 0 500 500')
    previewSvg.setAttribute('width', '100%')
    previewSvg.setAttribute('height', '200')
    previewSvg.style.border = '1px solid rgba(229, 231, 235, 0.8)'
    previewSvg.style.borderRadius = '8px'
    previewSvg.style.background = '#ffffff'
    
    // 사각형 복사
    const quadClone = activityState.quadShape.cloneNode(true)
    previewSvg.appendChild(quadClone)
    
    // 점 라벨 복사
    vertices.forEach((v, idx) => {
      if (v.labelEl) {
        const labelClone = v.labelEl.cloneNode(true)
        previewSvg.appendChild(labelClone)
      }
    })
    
    quadPreviewContainer.appendChild(previewSvg)
  }

  const infoShowLengthsBtn = document.getElementById('info-show-lengths-btn')
  const infoShowAnglesBtn = document.getElementById('info-show-angles-btn')
  const infoShowDiagonalsBtn = document.getElementById('info-show-diagonals-btn')
  const infoShowParallelBtn = document.getElementById('info-show-parallel-btn')
  const infoNextBtn = document.getElementById('info-next-btn')
  const parallelogramJudgment = document.getElementById('parallelogram-judgment')

  // 정보 확인 버튼 클릭 시 다음 단계 버튼 표시
  const showNextButton = () => {
    if (infoNextBtn) {
      infoNextBtn.style.display = 'block'
    }
  }

  if (infoShowLengthsBtn) {
    infoShowLengthsBtn.addEventListener('click', () => {
      showSideLengths(svg, vertices, infoResultsDiv, false)
      showNextButton()
    })
  }

  if (infoShowAnglesBtn) {
    infoShowAnglesBtn.addEventListener('click', () => {
      showAngles(svg, vertices, infoResultsDiv, false)
      showNextButton()
    })
  }

  if (infoShowDiagonalsBtn) {
    infoShowDiagonalsBtn.addEventListener('click', () => {
      showDiagonals(svg, vertices, infoResultsDiv, false)
      showNextButton()
    })
  }

  if (infoShowParallelBtn) {
    infoShowParallelBtn.addEventListener('click', () => {
      showParallelSides(svg, vertices, infoResultsDiv)
      showNextButton()
    })
  }

  // 다음 단계 버튼 클릭 시 평행사변형 판단 입력 창 표시
  if (infoNextBtn && parallelogramJudgment) {
    infoNextBtn.addEventListener('click', () => {
      parallelogramJudgment.style.display = 'block'
    })
  }
}

// 대변의 평행 여부 확인
function showParallelSides(svg, vertices, resultsDiv) {
  // 기존 평행선 제거
  activityState.parallelRulers.forEach(ruler => ruler.remove())
  activityState.parallelRulers = []
  
  // 변을 클릭 가능하게 만들기
  const edgeLabels = ['AB', 'BC', 'CD', 'DA']
  const edges = []
  
  for (let i = 0; i < 4; i++) {
    const v1 = vertices[i]
    const v2 = vertices[(i + 1) % 4]
    
    // 각 변을 선으로 그리기 (클릭 가능하도록)
    const edgeLine = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    edgeLine.setAttribute('x1', String(v1.x))
    edgeLine.setAttribute('y1', String(v1.y))
    edgeLine.setAttribute('x2', String(v2.x))
    edgeLine.setAttribute('y2', String(v2.y))
    edgeLine.classList.add('edge-selector')
    edgeLine.dataset.edgeIndex = String(i)
    edgeLine.style.cursor = 'pointer'
    edgeLine.style.stroke = '#2563eb'
    edgeLine.style.strokeWidth = '3'
    edgeLine.style.opacity = '0.6'
    svg.appendChild(edgeLine)
    activityState.parallelRulers.push(edgeLine)
    
    edges.push({
      index: i,
      label: edgeLabels[i],
      v1: v1,
      v2: v2,
      line: edgeLine
    })
  }
  
  // 변 클릭 이벤트
  let selectedEdge = null
  let parallelLine = null
  
  const handleEdgeClick = (event) => {
    const edgeLine = event.target.closest('.edge-selector')
    if (!edgeLine) return
    
    const edgeIndex = parseInt(edgeLine.dataset.edgeIndex)
    selectedEdge = edges[edgeIndex]
    
    // 기존 평행선 제거
    if (parallelLine) {
      parallelLine.remove()
    }
    
    // 선택된 변 강조 (진한 주황색)
    edges.forEach(e => {
      if (e.index === edgeIndex) {
        e.line.style.stroke = '#ea580c'
        e.line.style.strokeWidth = '4'
      } else {
        e.line.style.stroke = '#2563eb'
        e.line.style.strokeWidth = '3'
      }
    })
    
    // 평행선 생성 (초기 위치는 선택된 변의 중점을 지나도록)
    const midX = (selectedEdge.v1.x + selectedEdge.v2.x) / 2
    const midY = (selectedEdge.v1.y + selectedEdge.v2.y) / 2
    const dx = selectedEdge.v2.x - selectedEdge.v1.x
    const dy = selectedEdge.v2.y - selectedEdge.v1.y
    const length = Math.hypot(dx, dy)
    
    // 평행선의 방향 벡터
    const perpX = -dy / length * 50 // 수직 방향으로 50픽셀 이동
    const perpY = dx / length * 50
    
    parallelLine = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    parallelLine.setAttribute('x1', String(midX + perpX - dx / 2))
    parallelLine.setAttribute('y1', String(midY + perpY - dy / 2))
    parallelLine.setAttribute('x2', String(midX + perpX + dx / 2))
    parallelLine.setAttribute('y2', String(midY + perpY + dy / 2))
    parallelLine.classList.add('parallel-check-line')
    parallelLine.style.stroke = '#ea580c'
    parallelLine.style.strokeWidth = '2'
    parallelLine.style.strokeDasharray = '6 4'
    parallelLine.style.cursor = 'grab'
    svg.appendChild(parallelLine)
    activityState.parallelRulers.push(parallelLine)
    
    // 평행선 드래그 기능
    let isDragging = false
    let lastMousePos = null
    
    const startDrag = (e) => {
      if (e.target === parallelLine) {
        isDragging = true
        const rect = svg.getBoundingClientRect()
        lastMousePos = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        }
      }
    }
    
    const drag = (e) => {
      if (!isDragging || !lastMousePos) return
      
      const rect = svg.getBoundingClientRect()
      const currentX = e.clientX - rect.left
      const currentY = e.clientY - rect.top
      
      const dx = currentX - lastMousePos.x
      const dy = currentY - lastMousePos.y
      
      const x1 = parseFloat(parallelLine.getAttribute('x1'))
      const y1 = parseFloat(parallelLine.getAttribute('y1'))
      const x2 = parseFloat(parallelLine.getAttribute('x2'))
      const y2 = parseFloat(parallelLine.getAttribute('y2'))
      
      parallelLine.setAttribute('x1', String(x1 + dx))
      parallelLine.setAttribute('y1', String(y1 + dy))
      parallelLine.setAttribute('x2', String(x2 + dx))
      parallelLine.setAttribute('y2', String(y2 + dy))
      
      lastMousePos = { x: currentX, y: currentY }
    }
    
    const stopDrag = () => {
      isDragging = false
      lastMousePos = null
    }
    
    parallelLine.addEventListener('mousedown', startDrag)
    svg.addEventListener('mousemove', drag)
    svg.addEventListener('mouseup', stopDrag)
    svg.addEventListener('mouseleave', stopDrag)
    
    resultsDiv.innerHTML = `
      <div class="result-item">
        <strong>대변의 평행 여부 확인:</strong>
      </div>
      <div class="result-item">
        확인하고 싶은 변을 클릭하세요. 그 변과 평행한 직선이 나타나며, 드래그하여 움직일 수 있습니다.
      </div>
      <div class="result-item">
        현재 선택된 변: ${selectedEdge ? selectedEdge.label : '없음'}
      </div>
    `
  }
  
  edges.forEach(edge => {
    edge.line.addEventListener('click', handleEdgeClick)
  })
  
  resultsDiv.innerHTML = `
    <div class="result-item">
      <strong>대변의 평행 여부 확인:</strong>
    </div>
    <div class="result-item">
      확인하고 싶은 변을 클릭하세요. 그 변과 평행한 직선이 나타나며, 드래그하여 움직일 수 있습니다.
    </div>
  `
}

// 평행사변형 판단 이유 작성 섹션 설정
function setupJudgmentReasonSection() {
  const reasonInput = document.getElementById('judgment-reason-input')
  const reasonSubmitBtn = document.getElementById('judgment-reason-submit-btn')

  if (!reasonInput || !reasonSubmitBtn) return

  reasonSubmitBtn.addEventListener('click', () => {
    const reason = reasonInput.value.trim()
    if (reason) {
      alert('평행사변형이라고 판단한 이유가 저장되었습니다.')
      // 여기에 추가적인 처리 로직을 넣을 수 있습니다
    } else {
      alert('평행사변형이라고 판단한 이유를 작성해주세요.')
    }
  })
}

// 각 변의 길이 표시
function showSideLengths(svg, vertices, resultsDiv, showJudgment = true) {
  // 기존 길이 라벨 제거
  activityState.lengthLabels.forEach(label => label.remove())
  activityState.lengthLabels = []

  const lengths = []
  for (let i = 0; i < 4; i++) {
    const v1 = vertices[i]
    const v2 = vertices[(i + 1) % 4]
    const length = Math.hypot(v2.x - v1.x, v2.y - v1.y)
    lengths.push(Math.round(length))

    // 중점에 길이 표시
    const midX = (v1.x + v2.x) / 2
    const midY = (v1.y + v2.y) / 2
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    text.setAttribute('x', String(midX))
    text.setAttribute('y', String(midY))
    text.setAttribute('text-anchor', 'middle')
    text.setAttribute('dominant-baseline', 'middle')
    text.classList.add('length-label')
    text.textContent = String(lengths[i])
    svg.appendChild(text)
    activityState.lengthLabels.push(text)
  }

  // 결과 설명
  if (showJudgment) {
    const oppositeEqual = (lengths[0] === lengths[2] && lengths[1] === lengths[3])
    resultsDiv.innerHTML = `
      <div class="result-item">
        <strong>각 변의 길이:</strong> AB = ${lengths[0]}, BC = ${lengths[1]}, CD = ${lengths[2]}, DA = ${lengths[3]}
      </div>
      <div class="result-item">
        <strong>대변의 길이 비교:</strong> ${oppositeEqual ? '✓ 두 쌍의 대변의 길이가 각각 같습니다.' : '✗ 두 쌍의 대변의 길이가 같지 않습니다.'}
      </div>
    `
  } else {
    resultsDiv.innerHTML = `
      <div class="result-item">
        <strong>네 변의 길이:</strong> AB = ${lengths[0]}, BC = ${lengths[1]}, CD = ${lengths[2]}, DA = ${lengths[3]}
      </div>
    `
  }
}

// 네 각의 크기 표시
function showAngles(svg, vertices, resultsDiv, showJudgment = true) {
  // 기존 각도 라벨 제거
  activityState.angleLabels.forEach(label => label.remove())
  activityState.angleLabels = []

  const angles = []
  for (let i = 0; i < 4; i++) {
    const v1 = vertices[i]
    const v2 = vertices[(i + 1) % 4]
    const v3 = vertices[(i + 2) % 4]
    
    // 각도 계산 (벡터 내적 사용)
    const vec1 = { x: v2.x - v1.x, y: v2.y - v1.y }
    const vec2 = { x: v2.x - v3.x, y: v2.y - v3.y }
    const dot = vec1.x * vec2.x + vec1.y * vec2.y
    const mag1 = Math.hypot(vec1.x, vec1.y)
    const mag2 = Math.hypot(vec2.x, vec2.y)
    const angle = Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2)))) * (180 / Math.PI)
    angles.push(Math.round(angle))

    // 각도 표시 (꼭짓점 근처)
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    text.setAttribute('x', String(v2.x + 15))
    text.setAttribute('y', String(v2.y - 15))
    text.classList.add('angle-label')
    text.textContent = `${angles[i]}°`
    svg.appendChild(text)
    activityState.angleLabels.push(text)
  }

  // 결과 설명
  if (showJudgment) {
    const oppositeEqual = (angles[0] === angles[2] && angles[1] === angles[3])
    resultsDiv.innerHTML = `
      <div class="result-item">
        <strong>네 각의 크기:</strong> ∠A = ${angles[0]}°, ∠B = ${angles[1]}°, ∠C = ${angles[2]}°, ∠D = ${angles[3]}°
      </div>
      <div class="result-item">
        <strong>대각의 크기 비교:</strong> ${oppositeEqual ? '✓ 두 쌍의 대각의 크기가 각각 같습니다.' : '✗ 두 쌍의 대각의 크기가 같지 않습니다.'}
      </div>
    `
  } else {
    resultsDiv.innerHTML = `
      <div class="result-item">
        <strong>네 내각의 크기:</strong> ∠A = ${angles[0]}°, ∠B = ${angles[1]}°, ∠C = ${angles[2]}°, ∠D = ${angles[3]}°
      </div>
    `
  }
}

// 대각선 그리고 이등분 확인
function showDiagonals(svg, vertices, resultsDiv, showJudgment = true) {
  // 기존 대각선 제거
  activityState.diagonals.forEach(diag => diag.remove())
  activityState.diagonals = []

  // 두 대각선 그리기
  const diag1 = document.createElementNS('http://www.w3.org/2000/svg', 'line')
  diag1.setAttribute('x1', String(vertices[0].x))
  diag1.setAttribute('y1', String(vertices[0].y))
  diag1.setAttribute('x2', String(vertices[2].x))
  diag1.setAttribute('y2', String(vertices[2].y))
  diag1.classList.add('diagonal-line')
  svg.appendChild(diag1)
  activityState.diagonals.push(diag1)

  const diag2 = document.createElementNS('http://www.w3.org/2000/svg', 'line')
  diag2.setAttribute('x1', String(vertices[1].x))
  diag2.setAttribute('y1', String(vertices[1].y))
  diag2.setAttribute('x2', String(vertices[3].x))
  diag2.setAttribute('y2', String(vertices[3].y))
  diag2.classList.add('diagonal-line')
  svg.appendChild(diag2)
  activityState.diagonals.push(diag2)

  // 교점 계산
  const p1 = vertices[0]
  const p2 = vertices[2]
  const p3 = vertices[1]
  const p4 = vertices[3]

  // 선분 교점 계산
  const denom = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x)
  if (Math.abs(denom) < 0.001) {
    resultsDiv.innerHTML = '<div class="result-item">대각선이 교차하지 않습니다.</div>'
    return
  }

  const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / denom
  const intersection = {
    x: p1.x + t * (p2.x - p1.x),
    y: p1.y + t * (p2.y - p1.y)
  }

  // 교점 표시 및 라벨
  const intersectionPoint = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
  intersectionPoint.setAttribute('cx', String(intersection.x))
  intersectionPoint.setAttribute('cy', String(intersection.y))
  intersectionPoint.setAttribute('r', 4)
  intersectionPoint.classList.add('intersection-point')
  svg.appendChild(intersectionPoint)
  activityState.diagonals.push(intersectionPoint)

  // 교점 라벨 "O" 추가
  const intersectionLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text')
  intersectionLabel.setAttribute('x', String(intersection.x + 10))
  intersectionLabel.setAttribute('y', String(intersection.y - 10))
  intersectionLabel.classList.add('point-label')
  intersectionLabel.textContent = 'O'
  svg.appendChild(intersectionLabel)
  activityState.diagonals.push(intersectionLabel)

  // 각 꼭짓점에서 교점까지의 거리 계산
  const distances = []
  const labels = ['A', 'B', 'C', 'D']
  for (let i = 0; i < 4; i++) {
    const dist = Math.hypot(intersection.x - vertices[i].x, intersection.y - vertices[i].y)
    distances.push(Math.round(dist))
  }

  if (showJudgment) {
    // 각 대각선의 중점 계산
    const mid1 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 }
    const mid2 = { x: (p3.x + p4.x) / 2, y: (p3.y + p4.y) / 2 }

    // 교점과 중점의 거리
    const dist1 = Math.hypot(intersection.x - mid1.x, intersection.y - mid1.y)
    const dist2 = Math.hypot(intersection.x - mid2.x, intersection.y - mid2.y)

    const bisects = dist1 < 2 && dist2 < 2 // 2픽셀 오차 허용

    // 결과 설명
    resultsDiv.innerHTML = `
      <div class="result-item">
        <strong>대각선 교점:</strong> (${Math.round(intersection.x)}, ${Math.round(intersection.y)})
      </div>
      <div class="result-item">
        <strong>대각선 이등분:</strong> ${bisects ? '✓ 두 대각선이 서로 다른 것을 이등분합니다.' : '✗ 두 대각선이 서로 다른 것을 이등분하지 않습니다.'}
      </div>
    `
  } else {
    // 결과 설명 (값만 제시)
    resultsDiv.innerHTML = `
      <div class="result-item">
        <strong>두 대각선의 교점:</strong> O
      </div>
      <div class="result-item">
        <strong>점 O에서 각 꼭짓점까지의 거리:</strong>
      </div>
      <div class="result-item">
        OA = ${distances[0]}, OB = ${distances[1]}, OC = ${distances[2]}, OD = ${distances[3]}
      </div>
    `
  }
}
