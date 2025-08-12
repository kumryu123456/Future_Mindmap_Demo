# nlp_server.py
# Deno 함수로부터 텍스트 분석 요청을 받아 처리하는 Flask 기반 마이크로서비스입니다.

from flask import Flask, request, jsonify
from kiwipiepy import Kiwi

# --- 초기 설정 ---

# Flask 애플리케이션 인스턴스 생성
app = Flask(__name__)

# Kiwi 형태소 분석기 인스턴스 생성
# 이 객체는 서버가 실행되는 동안 메모리에 상주하며 재사용됩니다.
try:
    kiwi = Kiwi()
    print("✅ Kiwi 형태소 분석기 초기화 완료.")
except Exception as e:
    print(f"❌ Kiwi 초기화 실패: {e}")
    kiwi = None

# --- API 엔드포인트 정의 ---

@app.route('/parse', methods=['POST'])
def parse_text():
    """
    텍스트를 받아 형태소를 분석하고, 명사, 동사, 개체명을 추출하여 JSON으로 반환합니다.
    """
    if not kiwi:
        # Kiwi 초기화가 실패했을 경우 503 Service Unavailable 에러 반환
        return jsonify({"error": "NLP service is not available"}), 503

    # 1. 요청 데이터 확인
    if not request.is_json:
        return jsonify({"error": "Missing JSON in request"}), 400

    data = request.get_json()
    text = data.get('text', None)

    if not text or not isinstance(text, str) or not text.strip():
        return jsonify({"error": "Missing or invalid 'text' field"}), 400

    print(f"🔄 분석 요청 수신: {text[:50]}...")

    # 2. 형태소 분석 실행
    try:
        # kiwi.tokenize()를 사용하여 텍스트를 토큰으로 분해합니다.
        tokens = kiwi.tokenize(text)

        # 3. 품사(POS) 태그를 기반으로 키워드 분류
        # NNG: 일반 명사, NNP: 고유 명사, VV: 동사
        nouns = []
        verbs = []
        entities = []

        for token in tokens:
            # 일반 명사인 경우
            if token.tag == 'NNG':
                nouns.append(token.form)
            # 고유 명사인 경우 (개체명으로 간주)
            elif token.tag == 'NNP':
                entities.append(token.form)
            # 동사인 경우, 원형으로 추출 (예: '만들다')
            elif token.tag == 'VV':
                verbs.append(token.form + '다')

        # 중복 제거 및 결과 정리
        # set을 사용하여 중복을 제거하고 다시 list로 변환합니다.
        result = {
            "nouns": list(set(nouns)),
            "verbs": list(set(verbs)),
            "entities": list(set(entities))
        }
        
        print(f"✅ 분석 완료: {result}")

        # 4. 성공 응답 반환
        return jsonify(result), 200

    except Exception as e:
        print(f"❌ 분석 중 오류 발생: {e}")
        return jsonify({"error": "An error occurred during text processing"}), 500

# --- 서버 실행 ---

if __name__ == '__main__':
    # host='0.0.0.0'으로 설정하여 외부(Deno 함수)에서의 접근을 허용합니다.
    # 기본 포트는 5000번을 사용합니다.
    app.run(host='0.0.0.0', port=5000, debug=True)

