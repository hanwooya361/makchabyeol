-- 테스트는 개발 데이터와 섞이지 않게 별도 DB를 쓴다(application.yml의 test 프로필).
-- 볼륨이 비어 있을 때(컨테이너를 처음 만들 때) 한 번만 실행된다.
CREATE DATABASE makchabyeol_test OWNER makchabyeol;
