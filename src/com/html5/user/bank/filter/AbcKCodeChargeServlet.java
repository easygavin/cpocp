package com.html5.user.bank.filter;

import com.html5.user.bank.charge.AbcKCodeCharge;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * 农行K码充值servlet
 */
@SuppressWarnings("serial")
public class AbcKCodeChargeServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        doPost(req, resp);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        req.setCharacterEncoding("utf-8");
        resp.setContentType("text/html; charset=utf-8");
        String requestParameter = req.getParameter("data");
        if (null != requestParameter && !"".equals(requestParameter)) {
            String result = AbcKCodeCharge.getResponse(requestParameter);
            resp.getWriter().write(result);
        } else {
            resp.getWriter().write("{\"errorMsg\":\"请求不合法\"}");
        }
    }

    @Override
    public void destroy() {
        super.destroy();
    }

    @Override
    public void init() throws ServletException {
        super.init();
    }
}
