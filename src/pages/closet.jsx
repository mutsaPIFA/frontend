import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest, assetUrl } from '../api/client.js'
import BackButton from '../components/BackButton.jsx'
import BottomNav from '../components/BottomNav.jsx'
import FadeImg from '../components/FadeImg.jsx'
import ItemInfoModal from '../components/ItemInfoModal.jsx'
import LoadingOverlay from '../components/LoadingOverlay.jsx'
import { invalidateApiCache, useApi } from '../hooks/useApi.js'
import { closetItemImage, itemDisplayName, scanItemName } from '../lib/format.js'
import { tagColorHex, tagOptions } from '../lib/vocab.js'
import { stylingSession } from '../lib/stylingSession.js'

export function ClosetPage() {
  const navigate = useNavigate()
  const [source, setSource] = useState('OWN')
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const [viewItem, setViewItem] = useState(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const { data, setData, isLoading, error: loadError, reload } = useApi(async () => {
    const result = await apiRequest(`/api/v1/closet-items?source=${source}`)
    return Array.isArray(result) ? result : []
  }, [source], { cacheKey: `closet:${source}` })

  const items = data || []

  function switchSource(next) {
    setSource(next)
    setSelectedIds([])
  }

  // 기본 모드: 탭 = 옷 정보 보기 / 선택 모드: 탭 = 선택 토글
  function handleCardTap(item) {
    if (!isSelecting) {
      setViewItem(item)
      return
    }
    setSelectedIds((current) => current.includes(item.id) ? current.filter((itemId) => itemId !== item.id) : [...current, item.id])
  }

  function toggleSelecting() {
    setIsSelecting((current) => !current)
    setSelectedIds([])
  }

  function buildDna() {
    if (selectedIds.length === 0) return
    stylingSession.setDnaItemIds(selectedIds)
    navigate('/style-dna')
  }

  async function deleteSelectedItems() {
    setDeleteError('')
    try {
      await Promise.all(selectedIds.map((id) => apiRequest(`/api/v1/closet-items/${id}`, { method: 'DELETE' })))
      // 옷장 구성이 바뀌면 이를 재료로 쓰는 화면 캐시도 무효화
      invalidateApiCache('closet:')
      invalidateApiCache('dna:')
      invalidateApiCache('recommendations:')
      setData((current) => (current || []).filter((item) => !selectedIds.includes(item.id)))
      setSelectedIds([])
      setIsDeleteModalOpen(false)
    } catch {
      setDeleteError('아이템을 삭제하지 못했어요. 잠시 후 다시 시도해주세요.')
    }
  }

  return (
    <main className="closet-screen" data-node-id="53:280">
      <header className="closet-header">
        <BackButton onClick={() => window.history.back()} />
        <div className="closet-heading"><strong>내 옷장</strong><span>MY CLOSET</span></div>
        {isSelecting && (
          <button
            className="closet-delete-button"
            type="button"
            aria-label="선택한 아이템 삭제"
            disabled={selectedIds.length === 0}
            onClick={() => setIsDeleteModalOpen(true)}
          >
            <img src="/assets/closet/trash.svg" alt="" />
          </button>
        )}
      </header>

      <div className="closet-tabs" role="tablist" aria-label="옷장 출처">
        <button className={source === 'OWN' ? 'active' : ''} type="button" onClick={() => switchSource('OWN')} role="tab" aria-selected={source === 'OWN'}>OWN</button>
        <button className={source === 'MCM' ? 'active' : ''} type="button" onClick={() => switchSource('MCM')} role="tab" aria-selected={source === 'MCM'}>MCM</button>
      </div>

      <section className="closet-grid" aria-label="내 옷장 아이템">
        {isLoading && <p className="grid-status">옷장을 여는 중이에요...</p>}
        {!isLoading && loadError && (
          <div className="grid-status" role="alert">
            <p>{loadError}</p>
            <button className="retry-button" type="button" onClick={reload}>다시 시도</button>
          </div>
        )}
        {!isLoading && !loadError && items.length === 0 && (
          <div className="grid-status closet-empty">
            <p>아직 옷장이 비어 있어요.<br />첫 아이템을 스캔해서 채워볼까요?</p>
          </div>
        )}
        {items.map((item) => (
          <article
            className={`closet-card closet-selectable-card ${isSelecting && selectedIds.includes(item.id) ? 'selected' : ''}`}
            key={item.id}
            role="button"
            tabIndex={0}
            aria-pressed={isSelecting ? selectedIds.includes(item.id) : undefined}
            onClick={() => handleCardTap(item)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                handleCardTap(item)
              }
            }}
          >
            {isSelecting && (
              <img className="dna-selection-icon" src={`/assets/closet/${selectedIds.includes(item.id) ? 'selected.svg' : 'unselected.svg'}`} alt={selectedIds.includes(item.id) ? '선택됨' : '선택 안 됨'} />
            )}
            <div className="closet-image-wrap">
              <FadeImg src={closetItemImage(item)} alt="" loading="lazy" />
            </div>
            <div className="closet-info">
              <span>{item.source === 'MCM' ? 'MCM' : 'OWN'}</span>
              <p>{itemDisplayName(item)}</p>
            </div>
          </article>
        ))}
      </section>

      <Link className="closet-fab" to="/closet/scan" aria-label="아이템 추가하기">+</Link>

      <div className="closet-actions">
        {!isSelecting ? (
          <button className="add-item-button dna-build-button" type="button" onClick={toggleSelecting}>
            <span>스타일 추천 받기</span>
          </button>
        ) : (
          <>
            <button className="add-item-button closet-cancel-button" type="button" onClick={toggleSelecting}>
              <span>취소</span>
            </button>
            <button className="add-item-button dna-build-button" type="button" onClick={buildDna} disabled={selectedIds.length === 0}>
              <span>생성 {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}</span>
            </button>
          </>
        )}
      </div>

      <ItemInfoModal
        item={viewItem}
        editable
        onClose={() => setViewItem(null)}
        onSaved={(updated) => {
          setViewItem(updated)
          setData((current) => (current || []).map((it) => (it.id === updated.id ? updated : it)))
        }}
        onDeleted={(deletedId) => {
          setData((current) => (current || []).filter((it) => it.id !== deletedId))
        }}
      />

      {isDeleteModalOpen && (
        <div className="closet-delete-modal-layer" role="presentation" onClick={() => setIsDeleteModalOpen(false)}>
          <section
            className="closet-delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="closet-delete-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="closet-delete-title">선택한 아이템을<br />삭제할까요 ?</h2>
            {deleteError && <p className="closet-delete-error">{deleteError}</p>}
            <div className="closet-delete-actions">
              <button type="button" onClick={deleteSelectedItems}>네</button>
              <button type="button" onClick={() => setIsDeleteModalOpen(false)}>아니요</button>
            </div>
          </section>
        </div>
      )}

      <BottomNav active="closet" />
    </main>
  )
}

export function ScanPage() {
  const navigate = useNavigate()
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')

  function handleFileChange(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setError('')
  }

  async function handleUpload() {
    if (!selectedFile) {
      setError('앨범이나 카메라로 아이템 사진을 선택해주세요.')
      return
    }

    const formData = new FormData()
    formData.append('image', selectedFile)
    setIsUploading(true)
    setError('')

    try {
      const result = await apiRequest('/api/v1/scan', { method: 'POST', body: formData })
      stylingSession.setScanResult(result)
      navigate('/closet/scan/recognize')
    } catch (uploadError) {
      setError(uploadError.message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <main className="scan-screen" data-node-id="190:120">
      <header className="scan-header">
        <BackButton onClick={() => navigate('/closet')} />
        <div className="scan-heading"><strong>아이템 추가하기</strong><span>ADD ITEM</span></div>
      </header>

      <section className="scan-preview" aria-label="아이템 사진 미리보기">
        <div className="scan-frame" />
        {previewUrl && <img className="scan-item-image" src={previewUrl} alt="선택한 아이템" />}
        <img className="scan-plus" src="/assets/scan/scan-plus.svg" alt="" />
      </section>

      {error && <p className="scan-error" role="alert">{error}</p>}

      {/* 촬영(셔터) 가운데, 갤러리 오른쪽 — capture=environment라 모바일에선 카메라 앱이 바로 뜬다 */}
      <div className="scan-actions">
        <span className="scan-actions-spacer" aria-hidden="true" />
        <label className="camera-button" aria-label="카메라로 촬영">
          <img src="/assets/scan/camera-button.svg" alt="카메라로 촬영" />
          <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} />
        </label>
        <label className="album-button" aria-label="앨범에서 선택">
          <img src="/assets/scan/album-button.svg" alt="앨범에서 선택" />
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </label>
      </div>

      <button className="scan-submit" type="button" onClick={handleUpload} disabled={isUploading}>
        {isUploading ? '분석 중...' : selectedFile ? '아이템 분석하기' : '사진을 선택해주세요'}
      </button>

      {isUploading && (
        <LoadingOverlay
          image="/assets/loading-puppy.png"
          expectedSeconds={20}
          slides={previewUrl ? [previewUrl] : []}
          messages={[
            { title: '아이템을 살펴보고 있어요', subtitle: '사진 속 옷을 찾는 중이에요' },
            { title: '배경을 지우고 있어요', subtitle: '옷만 깔끔하게 오려내는 중' },
            { title: '종류와 색을 알아보고 있어요', subtitle: '어떤 아이템인지 읽는 중이에요' },
            { title: '소재와 무드까지 읽는 중', subtitle: '태그는 나중에 직접 고칠 수 있어요' },
          ]}
        />
      )}

      <BottomNav active="closet" />
    </main>
  )
}

export function RecognizeResultPage() {
  const navigate = useNavigate()
  const scanResult = useMemo(() => stylingSession.scanResult(), [])
  const [tags, setTags] = useState(scanResult?.tags || {})

  useEffect(() => {
    if (!scanResult) navigate('/closet/scan', { replace: true })
  }, [navigate, scanResult])

  // 계약 §3-1: AI 태그는 사용자가 수정 가능 — 수정본을 스캔 결과에 되써서 등록 단계가 그대로 쓰게 한다
  function updateTag(key, value) {
    const nextTags = { ...tags, [key]: value }
    setTags(nextTags)
    stylingSession.updateScanTags(nextTags)
  }

  if (!scanResult) return null
  const itemName = scanItemName(tags)
  const itemImage = assetUrl(scanResult.cutoutUrl || scanResult.originalUrl)

  return (
    <main className="recognize-screen" data-node-id="210:852">
      <header className="recognize-header">
        <BackButton onClick={() => navigate('/closet/scan')} />
        <div><strong>아이템 인식</strong><span>RECOGNIZE ITEM</span></div>
      </header>

      <div className="recognize-status"><img src="/assets/recognize/check.svg" alt="" /><span>아이템 인식 완료</span></div>

      <section className="recognize-item-card">
        <img className="recognize-item-image" src={itemImage} alt={itemName} />
        <div className="recognize-item-name">{itemName}</div>
      </section>

      <p className="recognize-tags-hint">태그가 다르면 탭해서 바꿀 수 있어요</p>
      <section className="recognize-tags" aria-label="인식된 태그 확인·수정">
        {[['category', '종류'], ['color', '색상'], ['material', '소재'], ['mood', '무드']].map(([key, label]) => (
          <label key={key}>
            <span>{label}</span>
            <select value={tags[key] || ''} onChange={(event) => updateTag(key, event.target.value)}>
              {!tags[key] && <option value="">선택</option>}
              {tagOptions[key].map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
        ))}
      </section>

      <div className="recognize-actions">
        <button type="button" onClick={() => navigate('/closet/scan')}><strong>다시 스캔하기</strong></button>
        <button type="button" onClick={() => navigate('/closet/scan/recognize/complete')}><strong>옷장에 넣기</strong></button>
      </div>

      <BottomNav active="closet" />
    </main>
  )
}

export function ClosetAddCompletePage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const scanResult = useMemo(() => stylingSession.scanResult(), [])
  const itemName = scanItemName(scanResult?.tags)
  const itemImage = assetUrl(scanResult?.cutoutUrl || scanResult?.originalUrl)

  useEffect(() => {
    if (!scanResult) {
      navigate('/closet/scan')
      return
    }

    const request = {
      source: 'OWN',
      category: scanResult.tags?.category,
      color: scanResult.tags?.color,
      material: scanResult.tags?.material,
      mood: scanResult.tags?.mood,
      imageUrl: scanResult.originalUrl,
      cutoutUrl: scanResult.cutoutUrl,
    }

    apiRequest('/api/v1/closet-items', { method: 'POST', body: JSON.stringify(request) })
      .then(() => {
        // 옷장이 늘었다 — 옷장·DNA·추천 화면 캐시 무효화
        invalidateApiCache('closet:')
        invalidateApiCache('dna:')
        invalidateApiCache('recommendations:')
      })
      .catch((requestError) => setError(requestError.message))
  }, [navigate, scanResult])

  return (
    <main className="closet-add-complete-screen" data-node-id="53:512">
      <section className="closet-add-complete-content" aria-live="polite">
        <img className="closet-add-complete-image" src={itemImage} alt={itemName} />
        <div className="closet-add-complete-copy">
          <h1>옷장에 추가됐어요 !</h1>
          <p className="closet-add-complete-english">ADDED TO YOUR CLOSET</p>
          <p className="closet-add-complete-item">{itemName}가<br />내 옷장에 들어왔어요</p>
        </div>
        {error && <p className="closet-add-complete-error" role="alert">{error}</p>}
      </section>

      <button className="closet-add-complete-button" type="button" onClick={() => navigate('/closet')}>
        <span>옷장으로 가기</span>
      </button>

      <BottomNav active="closet" />
    </main>
  )
}

export function StyleDnaPage() {
  const navigate = useNavigate()
  const recommendationCarouselRef = useRef(null)

  // 분석 대기 연출용 재료 — 선택한(없으면 전체) 옷 누끼
  const { data: closetForSlides } = useApi(async () => {
    const result = await apiRequest('/api/v1/closet-items')
    return Array.isArray(result) ? result : []
  }, [], { cacheKey: 'closet:all' })
  const slideIds = stylingSession.dnaItemIds()
  const dnaSlides = (closetForSlides || [])
    .filter((item) => slideIds.length === 0 || slideIds.includes(item.id))
    .map((item) => assetUrl(item.cutoutUrl || item.imageUrl))
    .filter(Boolean)
    .slice(0, 10)

  const dnaIds = stylingSession.dnaItemIds()
  const { data, isLoading, error, reload } = useApi(async () => {
    // 옷장에서 고르고 왔으면 그 아이템, 직접 진입이면 옷장 전체로 분석
    let ids = stylingSession.dnaItemIds()
    if (ids.length === 0) {
      const closet = await apiRequest('/api/v1/closet-items')
      ids = (Array.isArray(closet) ? closet : []).map((item) => item.id)
    }
    if (ids.length === 0) throw new Error('옷장에 아이템을 먼저 담아주세요. 스캔하면 스타일 DNA를 만들 수 있어요.')
    const body = JSON.stringify({ closetItemIds: ids })
    const [dna, recommendation] = await Promise.all([
      apiRequest('/api/v1/style-dna', { method: 'POST', body }),
      apiRequest('/api/v1/recommendations', { method: 'POST', body }),
    ])
    return { dna, recommendation }
  }, [], { cacheKey: `dna:${dnaIds.join(',')}` })

  const dna = data?.dna
  const recommendationPicks = [data?.recommendation?.bestPick, ...(data?.recommendation?.more ?? [])]
    .filter((pick) => pick?.product)

  function moveRecommendations(direction) {
    const carousel = recommendationCarouselRef.current
    if (!carousel) return
    const firstCard = carousel.querySelector('.recommendation-card')
    const cardStep = (firstCard?.getBoundingClientRect().width || 353) + 12
    carousel.scrollBy({ left: direction * cardStep, behavior: 'smooth' })
  }

  return (
    <main className="style-dna-screen" data-node-id="53:125">
      <header className="style-dna-header">
        <BackButton onClick={() => window.history.back()} />
        <div><strong>당신의 스타일 DNA</strong><span>YOUR STYLE DNA</span></div>
      </header>

      {isLoading && (
        <LoadingOverlay
          image="/assets/loading-puppy-styling.png"
          expectedSeconds={14}
          slides={dnaSlides}
          messages={[
            { title: '옷장을 살펴보고 있어요', subtitle: '어떤 취향인지 알아보는 중이에요' },
            { title: '컬러와 무드를 분석하고 있어요', subtitle: '자주 입는 색을 모아보는 중' },
            { title: '스타일 키워드를 뽑고 있어요', subtitle: '당신만의 DNA로 정리하는 중이에요' },
            { title: '어울리는 MCM도 고르고 있어요', subtitle: '채우면 좋은 아이템을 찾는 중' },
          ]}
        />
      )}

      {!isLoading && error && (
        <section className="style-dna-error" role="alert">
          <h1>스타일 DNA를 불러오지 못했어요</h1>
          <p>{error}</p>
          <button type="button" onClick={reload}>다시 시도하기</button>
        </section>
      )}

      {!isLoading && !error && data && (
        <>
          <section className="style-dna-section">
            <h1>당신의 스타일 DNA</h1>
            <div className="dna-summary-card">
              {/* 키워드 칩이 톡톡, 컬러 스와치가 차례로 채워진다 */}
              <div className="dna-keywords">
                {(dna?.keywords || []).map((keyword, i) => (
                  <em key={keyword} style={{ animationDelay: `${i * 0.12}s` }}>{keyword}</em>
                ))}
              </div>
              {(dna?.dominantColors || []).length > 0 && (
                <div className="dna-colors" aria-label={`주요 컬러: ${dna.dominantColors.join(', ')}`}>
                  {dna.dominantColors.map((color, i) => (
                    <i key={color} title={color} style={{ background: tagColorHex[color] || tagColorHex.기타, animationDelay: `${0.35 + i * 0.12}s` }} />
                  ))}
                </div>
              )}
              <p>{dna?.summary || '스타일 분석 결과를 준비하고 있어요.'}</p>
            </div>
          </section>

          <section className="style-dna-section recommendation-section">
            <div className="recommendation-heading-row">
              <h2>채우면 좋은 아이템</h2>
              <span className="recommendation-count">{recommendationPicks.length} PICKS</span>
            </div>
            <div className="recommendation-carousel-wrap">
              <button className="recommendation-arrow recommendation-arrow-prev" type="button" aria-label="이전 추천 제품" onClick={() => moveRecommendations(-1)}>‹</button>
              <div className="recommendation-carousel" ref={recommendationCarouselRef} aria-label="추천 상품 5가지">
                {recommendationPicks.map((pick, index) => (
                  <article
                    className="recommendation-card recommendation-card-clickable"
                    key={pick.product.id}
                    role="link"
                    tabIndex={0}
                    onClick={() => navigate(`/products/${pick.product.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        navigate(`/products/${pick.product.id}`)
                      }
                    }}
                  >
                    <span className="perfect-match">{index === 0 ? 'PERFECT MATCH' : `MATCH ${index + 1}`}</span>
                    <FadeImg className="recommendation-image" src={assetUrl(pick.product.imageUrl)} alt={pick.product.name} />
                    <p>{pick.product.name}</p>
                    <div className="recommendation-reason">
                      <div className="recommendation-reason-copy">
                        <strong>스타일리스트 코멘트</strong>
                        <span>{pick.reason || '현재 옷장 아이템과 자연스럽게 어울리는 상품이에요.'}</span>
                      </div>
                      <div className="recommendation-mascot">
                        <img src="/assets/loading-puppy-styling.png" alt="MCM 스타일리스트 꼬미" />
                        <span>MCM 스타일리스트 꼬미</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <button className="recommendation-arrow recommendation-arrow-next" type="button" aria-label="다음 추천 제품" onClick={() => moveRecommendations(1)}>›</button>
            </div>
          </section>
        </>
      )}

      <BottomNav active="closet" />
    </main>
  )
}
