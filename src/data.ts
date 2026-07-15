import { PainPointPreset, TrizPrinciple, ScamperPrompt } from './types';

export const PAIN_POINT_PRESETS: PainPointPreset[] = [
  {
    id: 'api-tracking',
    title: '마이크로서비스 API 추적 및 문서 관리 지연',
    description: '서비스 간 API 스펙 변경이 빈번히 발생하나, 변경 사항이 수동으로 업데이트되는 시스템 구조 상 동기화가 밀려 타 팀과의 통합 테스트 및 협업 단계에서 빈번한 에러 발생.',
    exampleConflict: 'API의 상세 변경 이력을 모두 투명하게 공유하고 검증하려 하면(이점), 이를 수동으로 작성 및 관리하는 데 엄청난 공수와 지연이 유발되어 개발 생산성이 저하된다(모순).'
  },
  {
    id: 'db-bottleneck',
    title: '트래픽 급증 시 데이터베이스 부하 및 쿼리 병목',
    description: '대규모 마케팅 행사나 실시간 이벤트 시 특정 서비스의 쓰기/읽기 트래픽이 폭증하여 데이터베이스 커넥션이 고갈되고 주요 비즈니스 쿼리의 응답 시간이 초과되는 현상.',
    exampleConflict: '데이터의 완벽한 실시간 정합성을 확보하려 단일 트랜잭션과 무거운 조인 쿼리를 유지하려 하면(이점), 트래픽 처리량(Throughput)이 급격히 저하되어 시스템이 전체 장애 상태에 빠진다(모순).'
  },
  {
    id: 'distributed-transaction',
    title: '분산 서비스 환경에서 데이터 일관성 및 장애 복구',
    description: '여러 서비스가 연계되어 비즈니스 시나리오를 구성할 때(예: 결제 -> 주문 -> 재고), 중간 과정에서 장애가 났을 때 부분 성공 데이터가 방치되어 데이터 정합성이 깨지는 문제.',
    exampleConflict: '모든 마이크로서비스 간에 즉각적인 데이터 일관성(Immediate Consistency)을 보장하려 동기식 호출을 묶으면(이점), 서비스 간 결합도(Coupling)와 네트워크 대기 시간이 누적되어 장애 전파율이 100%가 된다(모순).'
  },
  {
    id: 'crud-boilerplate',
    title: '반복적인 CRUD 및 보일러플레이트 코드 개발',
    description: '신규 도메인 서비스를 개설할 때마다 유사한 패턴의 엔티티 정의, 데이터 전송 객체(DTO), 매퍼, 기본 CRUD API, 예외 처리 코드를 손수 작성해야 하여 핵심 비즈니스 로직 작성 시간이 침해됨.',
    exampleConflict: '타입 안전하고 안정적인 계층형 아키텍처 규칙을 엄격하게 다 준수하려 코드를 꼼꼼히 작성하면(이점), 단순 작업의 비중이 비정상적으로 증가하여 릴리즈 주기가 늦어지고 비효율이 극대화된다(모순).'
  },
  {
    id: 'distributed-tracing',
    title: '분산 모니터링/로그 추적 미흡으로 인한 디버깅 지연',
    description: '사용자의 요청 하나가 10여 개의 마이크로서비스를 거치며 수행되지만, 공통 상관관계 ID(Correlation ID)나 분산 트레이싱 환경이 제대로 갖춰져 있지 않아 장애 시 원인 지점 규명에 수 시간이 소요됨.',
    exampleConflict: '모든 마이크로서비스의 입출력과 흐름을 상세하게 로깅하고 분석하려 하면(이점), 막대한 디스크 I/O와 로그 저장 비용이 발생하며 병목을 심화시킨다(모순).'
  },
  {
    id: 'legacy-migration',
    title: '레거시 모놀리스의 마이크로서비스 점진적 전환 부담',
    description: '거대한 모놀리식 시스템의 코드가 스파게티처럼 얽혀 있어, 특정 도메인(예: 배송)을 독립적인 마이크로서비스로 분리해 내는 과정에서 기존 기능의 오동작 우려와 사이드 이펙트 검증의 어려움.',
    exampleConflict: '기존 비즈니스 로직의 완벽한 검증과 무장애 배포를 동시에 보장하려면 수개월 간 대규모 통합 검증을 진행해야 하지만(이점), 그 사이 시장의 요구에 맞춘 신규 기능 배포 속도는 완전히 얼어붙게 된다(모순).'
  }
];

export const TRIZ_PRINCIPLES: TrizPrinciple[] = [
  {
    id: 'segmentation',
    name: 'Segmentation / Separation',
    nameKr: '분리 및 분할',
    description: '대상을 여러 개의 독립된 부품으로 나누거나, 조립식으로 만들거나, 시간/공간적으로 서로 분리하여 모순을 해결합니다.',
    example: '동기식 DB 결합 문제를 CQRS(명령과 조회의 분리) 패턴을 통해 해결합니다. 쓰기용 DB(원천 트랜잭션용)와 읽기용 DB(Redis 캐시 또는 Elasticsearch 조회 전용)를 분리하여 대량 조회가 쓰기 성능을 저해하지 않도록 만듭니다.'
  },
  {
    id: 'prior-action',
    name: 'Prior Action',
    nameKr: '선행 조치 (미리 하기)',
    description: '필요한 조치를 미리 취해 놓거나, 유용한 변경을 사전에 발생시키거나, 미리 대상을 가장 편리한 위치에 가져다 놓습니다.',
    example: '트래픽이 오기 전 미리 데이터베이스 커넥션 풀을 넉넉히 생성(Pre-warm)해 두거나, 인기 상품 상세 정보를 매시간 백그라운드 배치를 통해 Redis 캐시에 미리 적재(Pre-caching)하여 실시간 DB 쿼리를 제로로 만듭니다.'
  },
  {
    id: 'self-service',
    name: 'Self-Service',
    nameKr: '셀프서비스 (자조 행동)',
    description: '외부 시스템이나 사람이 개입하는 대신, 시스템 스스로나 대상물 자체가 스스로 유익한 동작을 수행하고 자가 관리하도록 만듭니다.',
    example: '서킷 브레이커(Circuit Breaker)를 도입하여 특정 외부 서비스 연동에 에러율이 임계값을 넘어가면 자동으로 경로를 차단하고 기본 응답(Fallback)을 리턴하게 함으로써, 운영자의 개입 없이도 장애 확산을 자체 방어합니다.'
  },
  {
    id: 'reverse',
    name: 'Reverse / Doing it in reverse',
    nameKr: '역발상 (반대로 하기)',
    description: '일반적인 방향과 정반대의 조치를 취하거나, 움직이는 부분을 고정하고 고정된 부분을 움직이거나, 위아래를 뒤집어 봅니다.',
    example: '상위 서비스가 하위 서비스에 요청을 직접 전달(Pull-driven/Direct Call)하는 방식에서 역으로 하위 서비스가 처리 완료 이벤트를 메시지 큐에 퍼블리싱(Push-driven/Event Sourcing)하는 비동기 이벤트를 설계하여 결합도를 역전시킵니다.'
  }
];

export const SCAMPER_PROMPTS: ScamperPrompt[] = [
  {
    letter: 'S',
    title: 'Substitute',
    titleKr: '대체하기',
    questions: [
      '기존 시스템의 데이터 저장소, 전송 프로토콜, 언어, 라이브러리를 더 적합한 다른 것으로 교체할 수 있는가?',
      '동기식 REST 통신을 비동기식 메시지 큐나 고성능 gRPC 프로토콜로 대체할 수 있는가?'
    ],
    serviceSwExamples: [
      '무거운 RDB 조인 조회를 속도가 극대화된 Key-Value 구조의 Redis 캐시 조회로 대체.',
      '수동 API 문서 작성 과정을 소스코드 주석 및 명세 기반의 Swagger/SpringDoc 자동 생성 도구로 대체.'
    ]
  },
  {
    letter: 'C',
    title: 'Combine',
    titleKr: '결합하기',
    questions: [
      '분산되어 있는 서로 다른 API나 프로세스를 통합하여 단일 인터페이스로 제공할 수 있는가?',
      '인프라 자원을 통합하여 인프라 비용과 관리 공수를 감축할 수 있는가?'
    ],
    serviceSwExamples: [
      '클라이언트의 수많은 마이크로서비스 개별 API 호출을 API Gateway 단에서 단일 진입점으로 결합 및 데이터 취합(API Composition).',
      '빌드, 테스트, 가시성 분석 단계를 하나의 CI/CD 파이프라인으로 통합 연계.'
    ]
  },
  {
    letter: 'A',
    title: 'Adapt',
    titleKr: '응용 및 벤치마킹',
    questions: [
      '다른 도메인, 하드웨어 공학, 혹은 네트워크 전송 등의 완전히 다른 분야의 기술 해결 방안을 내 서비스 소프트웨어 아키텍처에 모방 적용할 수 있는가?',
      '일반 가전제품이나 하드웨어에 쓰이는 안전 장치를 소프트웨어에 접목할 수 있는가?'
    ],
    serviceSwExamples: [
      '하드웨어 전기 회로가 과전류 발생 시 퓨즈를 끊는 메커니즘을 벤치마킹하여, 특정 마이크로서비스 장애 시 API 응답을 임시 차단하는 서킷 브레이커 소프트웨어 도입.',
      '제조 공장의 칸반(Kanban) 자재 관리 시스템을 응용하여, 메시지 큐의 소비 속도에 따른 배포 파이프라인 속도 조절 기법 설계.'
    ]
  },
  {
    letter: 'M',
    title: 'Modify / Magnify / Minify',
    titleKr: '수정, 확대, 축소하기',
    questions: [
      '성능을 극대화하기 위해 데이터 스키마를 더 유연하게(예: NoSQL 비정규화) 변경할 수 있는가?',
      'API 페이로드 크기를 대폭 축소하여 네트워크 오버헤드를 낮출 수 있는가?',
      '기존 동기 통신 시간을 최소화하기 위한 방법은 무엇인가?'
    ],
    serviceSwExamples: [
      '텍스트 기반의 JSON 응답을 바이너리 포맷인 Protocol Buffers(gRPC)로 전송하도록 수정하여 전송 효율을 최대 10배 Magnify.',
      '데이터베이스 정규화 규칙을 의도적으로 깨트린(Denormalization) 읽기 전용 뷰 테이블을 설계하여 쿼리 타임아웃 최소화(Minify).'
    ]
  },
  {
    letter: 'P',
    title: 'Put to another use',
    titleKr: '용도 변경하기',
    questions: [
      '시스템에서 단순히 쌓이기만 하던 모니터링 메트릭, 로그, 예외 정보 등의 원시 데이터를 다른 가치 있는 분석 용도로 전환할 수 있는가?',
      '개발 시 자동 생성된 소스코드나 단위 테스트 코드를 고객이나 다른 부서의 명세서로 재활용할 수 있는가?'
    ],
    serviceSwExamples: [
      '시스템 에러 로그를 엘라스틱서치(ELK)로 시각화하는 것에 더해, 실시간 비즈니스 이상 거래 감지 및 사기 행위 차단(FDS) 엔진의 입력 값으로 재활용.',
      'TDD(테스트 주도 개발)의 통합 테스트 코드 시나리오를 기획자가 실시간으로 확인하는 시스템 요구 명세서(Specification) 대용으로 연결.'
    ]
  },
  {
    letter: 'E',
    title: 'Eliminate',
    titleKr: '제거하기',
    questions: [
      '아키텍처 상 불필요한 레이어나 네트워크 홉(Hop), 동기 대기 시간을 완전히 제거할 수 있는가?',
      '수동으로 코딩해야 하는 반복 절차나 설정 파일 선언 부분을 완전히 생략할 수 있는가?'
    ],
    serviceSwExamples: [
      '중간 프록시 레이어를 과감히 생략하고 다이렉트 컨테이너 통신망을 구축하여 네트워크 지연 완전 해소.',
      '수동 CRUD 아키텍처 생성을 중단하고, 데이터베이스 스키마로부터 컨트롤러-서비스-리포지토리 코드를 1초 만에 자동 빌드해 주는 보일러플레이트 자동 생성 스크립트 도입.'
    ]
  },
  {
    letter: 'R',
    title: 'Reverse / Rearrange',
    titleKr: '재배열 및 역발상',
    questions: [
      '일반적인 요청 흐름(Request-Response)을 뒤집어 비동기 통지(Callback/Event-Driven) 방식으로 전환할 수 있는가?',
      '데이터 검증이나 인가 절차의 실행 단계를 앞뒤로 재정렬하여 서버 부하를 크게 분산할 수 있는가?'
    ],
    serviceSwExamples: [
      '사용자가 PDF 생성 요청을 마친 뒤 생성될 때까지 동기 대기하게 하는 대신, 요청은 즉시 성공(ID) 반환 후 백그라운드 큐에서 생성 완료 시 웹소켓 알림을 보내는 방식으로 순서 Rearrange.',
      '트랜잭션 내부에서 행해지던 무거운 데이터 검증을 트랜잭션 외부(Pre-commit / Interceptor 레이어)로 빼내어 DB 락 시간 대폭 단축.'
    ]
  }
];
