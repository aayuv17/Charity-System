<template>
  <v-app class="grey lighten-3" id="inspire">
    <v-app-bar app color="white" flat>
      <v-avatar
        :color="$vuetify.breakpoint.smAndDown ? 'grey darken-1' : 'transparent'"
        size="32"
      ></v-avatar>

      <v-tabs centered class="ml-n9" color="grey darken-1">
        <v-tab v-for="link in links" :key="link">
          {{ link }}
        </v-tab>
      </v-tabs>
    </v-app-bar>
    <v-content>
      <v-container>
        <!--<v-layout text-xs-center wrap>
          <v-col mb-4>
            <h1 class="display-3 font-weight-bold mb-3">
              Charity System
            </h1>
            <p class="subheading font-weight-regular">
              A charity system built using the Ethereum blockchain
            </p>
          </v-col>
        </v-layout>-->
        <br />
        <v-layout row justify-center>
          <v-dialog v-model="startProjectDialog" max-width="600px" persistent>
            <template v-slot:activator="{ on, attrs }">
              <v-btn color="purple darken-4" dark v-bind="attrs" v-on="on">
                Start a Fundraiser
              </v-btn>
            </template>
            <v-card>
              <!--The dialog box for starting the fundraiser--><!--Leave this as it is-->
              <v-card-title>
                <span class="headline font-weight-bold mt-2 ml-4"
                  >Fill out this form</span
                >
              </v-card-title>
              <v-card-text class="pt-0">
                <v-container class="pt-0" grid-list-md>
                  <v-layout wrap>
                    <v-flex xs12>
                      <v-text-field
                        label="Title"
                        persistent-hint
                        v-model="newProject.title"
                      >
                      </v-text-field>
                    </v-flex>
                    <v-flex xs12>
                      <v-textarea
                        label="Description"
                        persistent-hint
                        v-model="newProject.description"
                      >
                      </v-textarea>
                    </v-flex>
                    <v-flex xs12 sm6>
                      <v-text-field
                        label="Amount Needed (ETH)"
                        type="number"
                        step="0.0001"
                        min="0"
                        v-model="newProject.amountGoal"
                      >
                      </v-text-field>
                    </v-flex>
                    <v-flex xs12 sm6>
                      <v-text-field
                        label="Duration (in days)"
                        type="number"
                        v-model="newProject.duration"
                      >
                      </v-text-field>
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="purple darken-4"
                  flat
                  @click="
                    startProjectDialog = false;
                    newProject.isLoading = false;
                  "
                >
                  Close
                </v-btn>
                <v-btn
                  color="purple darken-4"
                  flat
                  @click="startProject"
                  :loading="newProject.isLoading"
                >
                  Save
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-layout>
      </v-container>
      <br />
      <v-card max-width="800" class="mx-auto">
        <v-carousel v-model="model" hide-delimiters>
          <v-carousel-item
            v-for="(project, index) in projectData"
            :key="index"
            :cycle="cycle"
          >
            <v-sheet height="100%" tile>
              <v-row class="fill-height" align="center" justify="center">
                <v-card>
                  <v-card-title primary-title>
                    <div>
                      <v-row>
                        <v-spacer></v-spacer>
                        <v-chip
                          :color="stateMap[project.currentState].color"
                          text-color="white"
                          class="mt-0"
                        >
                          {{ stateMap[project.currentState].text }}
                        </v-chip>
                      </v-row>
                      <br />
                      <span class="headline font-weight-bold">{{
                        project.projectTitle
                      }}</span>
                      <br />
                      <span>{{ project.projectDesc.substring(0, 100) }}</span>
                      <span v-if="project.projectDesc.length > 100">
                        ...
                        <a @click="projectData[index].dialog = true"
                          >[Show full]</a
                        >
                      </span>
                      <br /><br />
                      <span>
                        Up Until:
                        <b>{{ new Date(project.deadline * 1000) }}</b></span
                      >
                      <br />
                      Goal:
                      <b>{{ project.goalAmount / 10 ** 18 }} ETH </b>
                      <small v-if="project.currentState == 1"
                        >wasn't achieved before deadline</small
                      >
                      <small v-if="project.currentState == 2"
                        >has been achieved</small
                      >
                    </div>
                  </v-card-title>
                  <v-col
                    v-if="
                      project.currentState == 0 &&
                        account != project.projectStarter
                    "
                    class="d-flex ml-3"
                    xs12
                    sm6
                    md3
                  >
                    <v-text-field
                      label="Amount (in ETH)"
                      type="number"
                      step="0.0001"
                      min="0"
                      v-model="project.fundAmount"
                      style="width:100px"
                    ></v-text-field>
                    <v-btn
                      color="purple darken-4 white--text"
                      @click="fundProject(index)"
                      :loading="project.isLoading"
                    >
                      Make Donation
                    </v-btn>
                    <v-spacer></v-spacer>
                  </v-col>
                  <v-col class="d-flex ml-3" xs12 sm6 md3>
                    <v-btn
                      class="mt-3"
                      color="amber darken-1 white--text"
                      v-if="project.currentState == 1"
                      @click="getRefund(index)"
                      :loading="project.isLoading"
                    >
                      Get Refund
                    </v-btn>
                  </v-col>
                  <v-card-actions v-if="project.currentState == 0">
                    <span class="font-weight-bold" style="width: 200px">
                      {{ project.currentAmount / 10 ** 18 }} ETH
                    </span>
                    <v-spacer></v-spacer>
                    <v-progress-linear
                      height="10"
                      :color="stateMap[project.currentState].color"
                      :value="
                        (project.currentAmount / project.goalAmount) * 100
                      "
                    ></v-progress-linear>
                    <v-spacer></v-spacer>
                    <span
                      class="font-weight-bold text-end"
                      style="width: 200px"
                    >
                      {{ project.goalAmount / 10 ** 18 }} ETH
                    </span>
                  </v-card-actions>
                </v-card>
              </v-row>
            </v-sheet>
          </v-carousel-item>
        </v-carousel>
      </v-card>
    </v-content>
  </v-app>
</template>

<script>
import crowdfundInstance from "../contracts/crowdfundInstance";
import crowdfundProject from "../contracts/crowdfundProject";
import web3 from "../contracts/web3";

export default {
  name: "App",
  data: () => ({
    links: ["Dashboard", "Profile"],
    model: 0,
    startProjectDialog: false,
    account: null,
    stateMap: [
      { color: "purple darken-4", text: "Active" },
      { color: "red", text: "Expired" },
      { color: "green", text: "Completed" },
    ],
    projectData: [],
    newProject: { isLoading: false },
  }),
  mounted() {
    // this code snippet takes the account (wallet) that is currently active
    web3.eth.getAccounts().then((accounts) => {
      [this.account] = accounts;
      this.getProjects();
    });
  },
  methods: {
    getProjects() {
      crowdfundInstance.methods
        .returnAllProjects()
        .call()
        .then((projects) => {
          projects.forEach((projectAddress) => {
            const projectInst = crowdfundProject(projectAddress);
            projectInst.methods
              .getDetails()
              .call()
              .then((projectData) => {
                const projectInfo = projectData;
                projectInfo.isLoading = false;
                projectInfo.contract = projectInst;
                this.projectData.push(projectInfo);
              });
          });
        });
    },
    startProject() {
      this.newProject.isLoading = true;
      crowdfundInstance.methods
        .startProject(
          this.newProject.title,
          this.newProject.description,
          this.newProject.duration,
          web3.utils.toWei(this.newProject.amountGoal, "ether")
        )
        .send({
          from: this.account,
        })
        .then((res) => {
          const projectInfo = res.events.ProjectStarted.returnValues;
          projectInfo.isLoading = false;
          projectInfo.currentAmount = 0;
          projectInfo.currentState = 0;
          projectInfo.contract = crowdfundProject(projectInfo.contractAddress);
          this.startProjectDialog = false;
          this.newProject = { isLoading: false };
        });
    },
    fundProject(index) {
      if (!this.projectData[index].fundAmount) {
        return;
      }

      const projectContract = this.projectData[index].contract;
      this.projectData[index].isLoading = true;
      projectContract.methods
        .contribute()
        .send({
          from: this.account,
          value: web3.utils.toWei(this.projectData[index].fundAmount, "ether"),
        })
        .then((res) => {
          const newTotal = parseInt(
            res.events.FundingReceived.returnValues.currentTotal,
            10
          );
          const projectGoal = parseInt(this.projectData[index].goalAmount, 10);
          this.projectData[index].currentAmount = newTotal;
          this.projectData[index].isLoading = false;

          // Set project state to success
          if (newTotal >= projectGoal) {
            this.projectData[index].currentState = 2;
          }
        });
    },
    getRefund(index) {
      this.projectData[index].isLoading = true;
      this.projectData[index].contract.methods
        .getRefund()
        .send({
          from: this.account,
        })
        .then(() => {
          this.projectData[index].isLoading = false;
        });
    },
  },
};
</script>
