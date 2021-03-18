<template>
  <section>
    <!--工具条-->
    <toolbar :buttonList="buttonList" @callFunction="callFunction"></toolbar>
    <!--列表-->
    <el-table
      :data="jdcks"
      highlight-current-row
      @current-change="selectCurrentRow"
      v-loading="listLoading"
      @selection-change="selsChange"
      style="width: 100%"
    >
      <el-table-column type="selection" width="50"> </el-table-column>
      <el-table-column type="index" width="80"> </el-table-column>
      <el-table-column prop="jJDUserName" label="用户名" width="" sortable>
      </el-table-column>
      <el-table-column prop="jJDCookie" label="ck" width="" sortable>
      </el-table-column>
      <el-table-column
        prop="jUpdateTime"
        label="更新时间"
        :formatter="formatDate"
        width=""
        sortable
      >
      </el-table-column>
      <el-table-column
        prop="jCreateTime"
        label="创建时间"
        :formatter="formatDate"
        width=""
        sortable
      >
      </el-table-column>
      <el-table-column prop="jStatus" label="状态" width="" sortable>
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.jStatus == 0 ? 'success' : 'danger'"
            disable-transitions
            >{{ scope.row.jStatus == 0 ? "正常" : "禁用" }}
          </el-tag>
        </template>
      </el-table-column>
      <!-- <el-table-column label="操作" width="150">
                <template scope="scope">
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
                </template>
            </el-table-column> -->
    </el-table>

    <!--工具条-->
    <el-col :span="24" class="toolbar">
      <el-button
        type="danger"
        @click="batchRemove"
        :disabled="this.sels.length === 0"
        >批量删除</el-button
      >
      <el-pagination
        layout="prev, pager, next"
        @current-change="handleCurrentChange"
        :page-size="50"
        :total="total"
        style="float: right"
      >
      </el-pagination>
    </el-col>
    <!--新增界面-->
    <el-dialog
      title="新增"
      :visible.sync="addFormVisible"
      v-model="addFormVisible"
      :close-on-click-modal="false"
    >
      <el-row>
        <el-col :span="24">
          <el-container>
            <el-main
              ><div>
                <h1>请使用京东APP扫描二维码</h1>
                <el-image
                  style="width: 200px; height: 200px"
                  :src="qrimgurl"
                  placeholder="Barcode"
                ></el-image></div
            ></el-main>
          </el-container>
        </el-col>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="addFormVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click.native="addSubmit"
          :loading="addLoading"
          >提交</el-button
        >
      </div>
    </el-dialog>
  </section>
</template>

<script>
import util from "../../../util/date";
import * as signalR from "@aspnet/signalr";
import { getButtonList } from "../../promissionRouter";
import { BaseApiUrl, getJDCKLisytPage, getjdQrCodeImg } from "../../api/api";
import Toolbar from "../../components/Toolbar";

export default {
  components: { Toolbar },
  data() {
    return {
      filters: {
        name: "",
      },
      token: {
        Authorization: "Bearer ",
      },
      qrimgurl: "",
      jdcks: [],
      total: 0,
      buttonList: [],
      currentRow: null,
      page: 1,
      listLoading: false,
      sels: [], //列表选中列
      addDialogFormVisible: false,
      addFormVisible: false, //新增界面是否显示
      addLoading: false,
    };
  },
  methods: {
    selectCurrentRow(val) {
      this.currentRow = val;
    },
    selsChange: function (sels) {
      this.sels = sels;
    },
    handleCurrentChange(val) {
      this.page = val;
      this.getjdcks();
    },
    //批量删除
    batchRemove: function () {
      var ids = this.sels.map((item) => item.uID).toString();
      this.$confirm("确认删除选中记录吗？", "提示", {
        type: "warning",
      })
        .then(() => {
          this.listLoading = true;
          let para = { ids: ids };
          batchRemoveUser(para).then((res) => {
            this.listLoading = false;
            this.$message({
              message: "该功能未开放",
              type: "warning",
            });
            console.log(res);
          });
        })
        .catch(() => {});
    },
    //获取ck列表
    getjdcks() {
      let para = {
        page: this.page,
        key: this.filters.name,
      };
      this.listLoading = true;
      getJDCKLisytPage(para).then((res) => {
        this.total = res.data.response.dataCount;
        this.jdcks = res.data.response.data;
        this.listLoading = false;
      });
    },
    //显示新增界面
    handleAdd() {
      this.getQrcode();
    },
    callFunction(item) {
      this.filters = {
        name: item.search,
      };
      this[item.Func].apply(this, item);
    },
    formatDate: function (row, column) {
      if (column.property == "jUpdateTime") {
        return util.formatDate.format(
          new Date(row.jUpdateTime),
          "yyyy-MM-dd hh:mm:ss"
        );
      } else if (column.property == "jCreateTime") {
        return util.formatDate.format(
          new Date(row.jCreateTime),
          "yyyy-MM-dd hh:mm:ss"
        );
      }
    },
    async getQrcode() {
      var para = {};
      this.listLoading = true;
      getjdQrCodeImg(para).then((result) => {
        this.qrimgurl = URL.createObjectURL(result.data);
        this.addFormVisible = true;
        this.listLoading = false;
      });
    },
  },
  mounted() {
    this.getjdcks();
    let _this = this;
    let tokenStr = window.localStorage.Token;
    this.token = {
      Authorization: "Bearer " + tokenStr,
    };
    let myuser = JSON.parse(window.localStorage.user);
    let routers = window.localStorage.router
      ? JSON.parse(window.localStorage.router)
      : [];
    this.buttonList = getButtonList(this.$route.path, routers);

    _this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${BaseApiUrl}/api2/chatHub`)
      .configureLogging(signalR.LogLevel.Information)
      .build();
    _this.connection.start().then(() => {});
    _this.connection.on("ReceiveMessage", function (user, message) {
      if (user == myuser.uID) {
        var msg = JSON.parse(message);
        if (msg.ck != "") {
          _this.$notify({
            type: "success",
            message: `获取CK成功,刷新页面...`,
            duration: 3000,
          });
        } else {
          _this.$notify.error({
            title: "失败",
            message: `获取CK失败,` + msg.desc,
            duration: 3000,
          });
        }
        setTimeout(() => {
          location.reload();
        }, 3500);
        // console.log(msg.desc);
      }
    });
  },
};
</script>

<style scoped>
.el-main {
    text-align: center;
  }
</style>
