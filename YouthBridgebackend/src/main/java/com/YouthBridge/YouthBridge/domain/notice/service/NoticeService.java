package com.YouthBridge.YouthBridge.domain.notice.service;

import com.YouthBridge.YouthBridge.domain.notice.dto.NoticeResponse;
import com.YouthBridge.YouthBridge.domain.notice.entity.Notice;
import com.YouthBridge.YouthBridge.domain.notice.repository.NoticeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NoticeService {

    private final NoticeRepository noticeRepository;

    // 공지사항 목록 (누구나)
    public Page<NoticeResponse> getNotices(int page, int size) {
        return noticeRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size))
                .map(NoticeResponse::from);
    }

    // 공지사항 작성 (관리자)
    @Transactional
    public NoticeResponse createNotice(String title, String content, String authorName) {
        Notice notice = Notice.create(title, content, authorName);
        return NoticeResponse.from(noticeRepository.save(notice));
    }

    // 공지사항 삭제 (관리자)
    @Transactional
    public void deleteNotice(Long id) {
        noticeRepository.deleteById(id);
    }
}
