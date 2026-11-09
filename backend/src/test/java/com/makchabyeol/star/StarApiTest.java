package com.makchabyeol.star;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.makchabyeol.common.NightDate;
import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

/** 컨트롤러·서비스·DB를 한 번에 통과시킨다. 계층을 따로 흉내 내도 같은 걸 두 번 볼 뿐이다. */
@SpringBootTest
@AutoConfigureMockMvc
class StarApiTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private StarRepository stars;
    @Autowired private StarService starService;

    private String body(String visitorId) {
        return "{\"visitorId\":\"" + visitorId + "\"}";
    }

    @Test
    void 별을_띄우면_201과_서버가_정한_좌표가_온다() throws Exception {
        mockMvc.perform(
                        post("/api/v1/stars")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(body(UUID.randomUUID().toString())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.x").value(org.hamcrest.Matchers.allOf(
                        org.hamcrest.Matchers.greaterThanOrEqualTo(0),
                        org.hamcrest.Matchers.lessThanOrEqualTo(1000))))
                .andExpect(jsonPath("$.y").value(org.hamcrest.Matchers.allOf(
                        org.hamcrest.Matchers.greaterThanOrEqualTo(0),
                        org.hamcrest.Matchers.lessThanOrEqualTo(1000))))
                .andExpect(jsonPath("$.hue").value(org.hamcrest.Matchers.allOf(
                        org.hamcrest.Matchers.greaterThanOrEqualTo(0),
                        org.hamcrest.Matchers.lessThanOrEqualTo(359))))
                .andExpect(jsonPath("$.starCount").value(
                        org.hamcrest.Matchers.greaterThanOrEqualTo(1)));
    }

    @Test
    void 방금_띄운_별이_오늘_밤_하늘에_보인다() throws Exception {
        long before = starService.night().starCount();

        mockMvc.perform(
                        post("/api/v1/stars")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(body(UUID.randomUUID().toString())))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/night"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nightDate").value(NightDate.of(Instant.now()).toString()))
                .andExpect(jsonPath("$.starCount").value((int) before + 1))
                .andExpect(jsonPath("$.stars").isArray());
    }

    @Test
    void UUID가_아니면_400과_통일된_에러_형식() throws Exception {
        mockMvc.perform(
                        post("/api/v1/stars")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(body("not-a-uuid")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_VISITOR_ID"))
                .andExpect(jsonPath("$.message").isString());
    }

    @Test
    void visitorId가_없으면_400() throws Exception {
        mockMvc.perform(post("/api/v1/stars").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_VISITOR_ID"));
    }

    @Test
    void 걱정_원문이_들어갈_자리는_저장되지_않는다() {
        UUID visitor = UUID.randomUUID();
        StarResponse created = starService.create(visitor);

        Star saved = stars.findById(created.id()).orElseThrow();
        // 엔티티에 글을 담는 필드 자체가 없다는 걸 좌표·색만 남는 것으로 확인한다
        assertThat(saved.getNightDate()).isEqualTo(NightDate.of(Instant.now()));
        assertThat(saved.getPosX()).isBetween((short) 0, (short) 1000);
        assertThat(saved.getHue()).isBetween((short) 0, (short) 359);
    }
}
