package com.makchabyeol.cardtap;

import static org.assertj.core.api.Assertions.assertThat;
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
import org.springframework.test.web.servlet.ResultActions;

@SpringBootTest
@AutoConfigureMockMvc
class CardTapApiTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private CardTapRepository taps;

    private ResultActions tap(String visitorId) throws Exception {
        return mockMvc.perform(
                post("/api/v1/card-taps")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"visitorId\":\"" + visitorId + "\"}"));
    }

    @Test
    void 오늘_처음_찍으면_201과_밤_날짜가_온다() throws Exception {
        tap(UUID.randomUUID().toString())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nightDate").value(NightDate.of(Instant.now()).toString()))
                .andExpect(jsonPath("$.firstToday").value(true));
    }

    @Test
    void 같은_밤에_또_찍으면_200이고_행은_하나다() throws Exception {
        String visitorId = UUID.randomUUID().toString();
        long before = taps.count();

        tap(visitorId).andExpect(status().isCreated());
        tap(visitorId).andExpect(status().isOk()).andExpect(jsonPath("$.firstToday").value(false));

        assertThat(taps.count()).isEqualTo(before + 1);
    }

    @Test
    void 다른_사람은_같은_밤에도_각자_찍는다() throws Exception {
        tap(UUID.randomUUID().toString()).andExpect(status().isCreated());
        tap(UUID.randomUUID().toString()).andExpect(status().isCreated());
    }

    @Test
    void UUID가_아니면_400과_통일된_에러_형식() throws Exception {
        tap("not-a-uuid")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_VISITOR_ID"))
                .andExpect(jsonPath("$.message").isString());
    }
}
