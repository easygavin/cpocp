package com.html5.user.bank.filter;

import com.html5.user.bank.bindcard.BandingBankCard;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.Serializable;

/**
 * 绑定银行卡servlet
 */
@SuppressWarnings("serial")
public class BandingBankCardServlet extends HttpServlet implements Serializable {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("utf-8");
        response.setContentType("text/html; charset=utf-8");
        String requestParameter = request.getParameter("data");
        if (requestParameter != null && !"".equals(requestParameter)) {
            String result = BandingBankCard.bindResponseData(requestParameter);
            response.getWriter().write(result);
        } else {
            response.getWriter().write("{\"errorMsg\":\"请求不合法\"}");
        }
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        doPost(req, resp);
    }
}
